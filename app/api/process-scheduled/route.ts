import { NextRequest, NextResponse } from 'next/server'
import { getScheduledMessagesPendingDelivery, updateMessageStatus } from '@/lib/storage'
import { getUserSettings } from '@/lib/settings'
import { sendReminderEmail } from '@/lib/email'
import { sendTenantSms } from '@/lib/sms'
import { recordSmsSent } from '@/lib/usage'
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
    // This endpoint sends real texts and records billable usage, so it must
    // not be publicly triggerable. Gate solely on the CRON_SECRET bearer token
    // (the internal /api/cron call passes it). We no longer trust a "vercel"
    // User-Agent — that header is attacker-controlled and bypassed the secret.
    const expectedAuth = process.env.CRON_SECRET
    if (
      expectedAuth &&
      request.headers.get('authorization') !== `Bearer ${expectedAuth}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    
    // Cache per-user settings within this run (for the email-reminder opt-in).
    const settingsCache = new Map<string, any>()
    const userSettingsFor = async (userId?: string) => {
      if (!userId) return null
      if (settingsCache.has(userId)) return settingsCache.get(userId)
      const s = await getUserSettings(userId, '')
      settingsCache.set(userId, s)
      return s
    }

    // Process each message
    for (const message of messagesToSend) {
      console.log(`Processing message ${message.id} for ${message.clientName}`)
      console.log(`Scheduled for: ${message.scheduledFor}, Now: ${now.toISOString()}`)

      // Messages without an owner can't be quota'd or billed — never send them.
      if (!message.userId) {
        console.error(`Message ${message.id} has no userId — marking failed, not sending`)
        await updateMessageStatus(message.id, 'failed')
        continue
      }

      // Atomic per-message claim: if two runs overlap (Vercel cron + an
      // external cron, or a concurrent manual trigger), only one may send a
      // given message. The non-atomic message store can't guarantee this.
      const claimed = await kv.set(`sent:claim:${message.id}`, '1', { nx: true, ex: 600 })
      if (claimed === null) {
        console.log(`Message ${message.id} already claimed by a concurrent run — skipping`)
        continue
      }

      const success = await sendScheduledSMS(message)
      
      if (success) {
        // Update message status to 'sent' in persistent storage
        await updateMessageStatus(message.id, 'sent')
        
        // Record usage: legacy lifetime counter + monthly quota/overage
        // accounting (queues overage texts for invoice-item billing).
        if (message.userId) {
          await recordSmsSent(message.userId)
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

      // Email reminder alongside the SMS, if the user enabled it and the client
      // has an email. No-ops cleanly until the Resend domain is verified.
      try {
        if (message.userId && message.email) {
          const s = await userSettingsFor(message.userId)
          if (s?.emailReminders) {
            const ok = await sendReminderEmail(message.email, s.studioName || '', message.message)
            console.log(`Email reminder for ${message.id}: ${ok ? 'sent' : 'skipped/failed'}`)
          }
        }
      } catch (e) {
        console.error('Email reminder error:', e)
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
    // Personalize (defensive — the stored message is usually already rendered).
    const finalMessage = (message.message || '')
      .replace(/{name}/g, message.clientName || '')
      .replace(/{sessionTitle}/g, message.sessionTitle || '')
      .replace(/{sessionTime}/g, message.sessionTime || '')
      .replace(/{email}/g, message.email || '')
      .replace(/{phone}/g, message.phone || '')

    // Routes to the tenant's own Twilio sender when active, else TextMagic.
    const r = await sendTenantSms(message.userId, message.phone, finalMessage)
    if (!r.ok) {
      console.error(`Scheduled SMS failed for ${message.clientName} (${message.phone}):`, r.error)
      return false
    }
    console.log(`Scheduled SMS sent to ${message.clientName} via ${r.provider}`)
    return true
  } catch (error) {
    console.error('Error sending scheduled SMS:', error)
    return false
  }
}