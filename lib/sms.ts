// Single entry point for sending an SMS for a tenant.
// Routes to the tenant's own Twilio sender when active (the per-tenant/ISV
// model); otherwise falls back to the shared TextMagic account. This lets us
// migrate studios to Twilio one at a time without a big-bang cutover.

import { cleanPhone } from './reminders'
import { getTenantSmsSender } from './settings'
import { sendViaTwilio } from './twilio'

export interface SendResult {
  ok: boolean
  provider: 'twilio' | 'textmagic' | 'none'
  error?: string
}

export async function sendTenantSms(
  userId: string | undefined,
  phoneRaw: string,
  body: string
): Promise<SendResult> {
  const tenDigit = cleanPhone(phoneRaw) // 10-digit US (TextMagic format)
  const e164 = tenDigit.length === 10 ? `+1${tenDigit}` : `+${tenDigit}` // Twilio format

  // 1) Per-tenant Twilio sender, if active.
  if (userId) {
    const sender = await getTenantSmsSender(userId)
    if (sender?.status === 'active' && (sender.messagingServiceSid || sender.phoneNumber)) {
      const r = await sendViaTwilio(e164, body, {
        messagingServiceSid: sender.messagingServiceSid,
        from: sender.phoneNumber,
      })
      if (r.ok) return { ok: true, provider: 'twilio' }
      // Don't silently drop the reminder — fall back to TextMagic on Twilio error.
      console.error(`Twilio send failed for user ${userId}, falling back to TextMagic:`, r.error)
    }
  }

  // 2) Shared TextMagic fallback.
  const ok = await sendViaTextMagic(tenDigit, body)
  return { ok, provider: ok ? 'textmagic' : 'none' }
}

async function sendViaTextMagic(phone: string, body: string): Promise<boolean> {
  const apiKey = process.env.TEXTMAGIC_API_KEY
  const username = process.env.TEXTMAGIC_USERNAME
  if (!apiKey || !username) {
    console.error('TextMagic credentials not configured')
    return false
  }
  try {
    const res = await fetch('https://rest.textmagic.com/api/v2/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-TM-Username': username, 'X-TM-Key': apiKey },
      body: JSON.stringify({ text: body, phones: phone }),
    })
    if (!res.ok) {
      console.error('TextMagic API error:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (e) {
    console.error('TextMagic send error:', e)
    return false
  }
}
