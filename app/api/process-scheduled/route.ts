import { NextRequest, NextResponse } from 'next/server'
import { getScheduledMessagesPendingDelivery, updateMessageStatus } from '@/lib/storage'
import { kv } from '@vercel/kv'

// This endpoint should be called periodically (e.g., every 15 minutes) by a cron job
// In production, you could use Vercel Cron Jobs, GitHub Actions, or an external service

// Helper function to check if current time is before 8am EST
function isBeforeEightAmEST(): boolean {
  const now = new Date()
  
  // Get Eastern Time (automatically handles EST/EDT)
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  const easternHour = easternTime.getHours()
  
  console.log(`Current UTC time: ${now.toISOString()}`)
  console.log(`Eastern time: ${easternTime.toLocaleString("en-US", {timeZone: "America/New_York"})}`)
  console.log(`Eastern hour: ${easternHour}`)
  
  return easternHour < 8
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== MANUAL CRON JOB PROCESSING START ===')
    
    // Get messages that need to be sent
    const messagesToSend = await getScheduledMessagesPendingDelivery()
    const now = new Date()
    const processedMessages = []
    
    console.log(`Found ${messagesToSend.length} messages ready to send`)
    
    // Check if it's too early to send messages (before 8am EST)
    if (isBeforeEightAmEST()) {
      console.log('⏰ Time restriction: It is before 8am EST, skipping all message sending')
      return NextResponse.json({
        success: true,
        processed: 0,
        messages: [],
        totalScheduled: messagesToSend.length,
        skipped: messagesToSend.length,
        reason: 'Time restriction: Messages cannot be sent before 8am EST'
      })
    }
    
    // Process each message
    for (const message of messagesToSend) {
      console.log(`Processing message ${message.id} for ${message.clientName}`)
      console.log(`Scheduled for: ${message.scheduledFor}, Now: ${now.toISOString()}`)
      
      const success = await sendScheduledSMS(message)
      
      if (success) {
        // Update message status to 'sent' in persistent storage
        await updateMessageStatus(message.id, 'sent')
        
        // Update user's SMS usage counter if message has userId
        if (message.userId) {
          try {
            const userData = await kv.hgetall(`user:${message.userId}`)
            if (userData) {
              const currentUsage = Number(userData.sms_usage) || 0
              const newUsage = currentUsage + 1
              await kv.hset(`user:${message.userId}`, { sms_usage: newUsage })
              console.log(`Updated SMS usage for user ${message.userId}: ${currentUsage} -> ${newUsage}`)
            }
          } catch (error) {
            console.error('Failed to update SMS usage counter:', error)
          }
        }
        
        processedMessages.push({
          id: message.id,
          clientName: message.clientName,
          phone: message.phone,
          reminderType: message.reminderType,
          status: 'sent',
          sentAt: now.toISOString(),
        })
        console.log(`✅ Message ${message.id} sent successfully`)
      } else {
        // Mark as failed in persistent storage
        await updateMessageStatus(message.id, 'failed')
        processedMessages.push({
          id: message.id,
          clientName: message.clientName,
          phone: message.phone,
          reminderType: message.reminderType,
          status: 'failed',
          error: 'SMS sending failed',
        })
        console.log(`❌ Message ${message.id} failed to send`)
      }
    }
    
    console.log(`=== CRON JOB PROCESSING COMPLETE ===`)
    console.log(`Processed: ${processedMessages.length} messages`)
    
    return NextResponse.json({
      success: true,
      processed: processedMessages.length,
      messages: processedMessages,
      totalScheduled: messagesToSend.length,
    })
  } catch (error) {
    console.error('Background job error:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function sendScheduledSMS(message: any): Promise<boolean> {
  try {
    const apiKey = process.env.TEXTMAGIC_API_KEY
    const username = process.env.TEXTMAGIC_USERNAME

    if (!apiKey || !username) {
      console.error('TextMagic API credentials not configured')
      return false
    }

    // Clean phone number - TextMagic expects numbers without + prefix
    let cleanPhone = message.phone.replace(/[^\d]/g, '')
    
    // Ensure 10-digit US format (TextMagic doesn't want + prefix)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      cleanPhone = cleanPhone.substring(1) // Remove leading 1
    } else if (cleanPhone.length !== 10) {
      // If not 10 digits, assume US and pad/trim as needed
      if (cleanPhone.length > 10) {
        cleanPhone = cleanPhone.substring(cleanPhone.length - 10)
      }
    }

    // Replace template variables in the message
    let finalMessage = message.message
      .replace(/{name}/g, message.clientName)
      .replace(/{sessionTitle}/g, message.sessionTitle)
      .replace(/{sessionTime}/g, message.sessionTime)
      .replace(/{email}/g, message.email)
      .replace(/{phone}/g, message.phone)

    const textMagicPayload = {
      text: finalMessage,
      phones: cleanPhone,
    }

    console.log('Sending SMS via TextMagic:', textMagicPayload)

    const response = await fetch('https://rest.textmagic.com/api/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TM-Username': username,
        'X-TM-Key': apiKey,
      },
      body: JSON.stringify(textMagicPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('TextMagic API error:', errorText)
      return false
    }

    const result = await response.json()
    console.log(`Scheduled SMS sent successfully to ${message.clientName} (${message.phone}):`, result)
    return true
  } catch (error) {
    console.error('Error sending scheduled SMS:', error)
    return false
  }
}