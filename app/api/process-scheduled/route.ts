import { NextRequest, NextResponse } from 'next/server'

// This endpoint should be called periodically (e.g., every 15 minutes) by a cron job
// In production, you could use Vercel Cron Jobs, GitHub Actions, or an external service

export async function POST(request: NextRequest) {
  try {
    // Get all scheduled messages
    const scheduledResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schedule-reminders`, {
      method: 'GET',
    })
    
    if (!scheduledResponse.ok) {
      throw new Error('Failed to fetch scheduled messages')
    }
    
    const { scheduledMessages } = await scheduledResponse.json()
    const now = new Date()
    const processedMessages = []
    
    // Find messages that should be sent now
    for (const message of scheduledMessages) {
      if (message.status === 'scheduled') {
        const scheduledTime = new Date(message.scheduledFor)
        
        // Check if it's time to send (within the last 15 minutes)
        const timeDiff = now.getTime() - scheduledTime.getTime()
        const fifteenMinutes = 15 * 60 * 1000
        
        if (timeDiff >= 0 && timeDiff <= fifteenMinutes) {
          // Time to send this message
          const success = await sendScheduledSMS(message)
          
          if (success) {
            // Update message status to 'sent'
            message.status = 'sent'
            processedMessages.push({
              id: message.id,
              clientName: message.clientName,
              status: 'sent',
              sentAt: now.toISOString(),
            })
          } else {
            // Mark as failed
            message.status = 'failed'
            processedMessages.push({
              id: message.id,
              clientName: message.clientName,
              status: 'failed',
              error: 'SMS sending failed',
            })
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: processedMessages.length,
      messages: processedMessages,
    })
  } catch (error) {
    console.error('Background job error:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled messages' },
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

    // Clean phone number
    const cleanPhone = message.phone.replace(/[^\d+]/g, '')

    const textMagicPayload = {
      text: message.message,
      phones: cleanPhone,
      from: 'SessionRemind'
    }

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

    console.log(`Scheduled SMS sent successfully to ${message.clientName} (${message.phone})`)
    return true
  } catch (error) {
    console.error('Error sending scheduled SMS:', error)
    return false
  }
}