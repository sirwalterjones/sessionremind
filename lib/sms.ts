// Single entry point for sending an SMS for a tenant.
// Sender priority:
//   1. the tenant's OWN active Twilio number (per-tenant/ISV upgrade)
//   2. the SHARED platform toll-free number (the default for everyone else)
//   3. the legacy TextMagic account (last resort, until fully migrated)
// Per-tenant always wins over shared, so studios can be upgraded one at a time.

import { kv } from '@vercel/kv'
import { cleanPhone } from './reminders'
import { getSharedSmsSender, getTenantSmsSender } from './settings'
import { sendViaTwilio } from './twilio'

export interface SendResult {
  ok: boolean
  provider: 'twilio' | 'textmagic' | 'none'
  error?: string
  suppressed?: boolean
}

// Twilio error codes that mean the recipient opted out — do NOT fall back to the
// shared number in that case, or we'd send around the opt-out.
const OPT_OUT_CODES = new Set([21610])

export async function sendTenantSms(
  userId: string | undefined,
  phoneRaw: string,
  body: string
): Promise<SendResult> {
  const tenDigit = cleanPhone(phoneRaw) // 10-digit US (TextMagic format)
  const e164 = tenDigit.length === 10 ? `+1${tenDigit}` : `+${tenDigit}` // Twilio format

  // 0) Respect opt-outs recorded from inbound STOP messages.
  if (await isOptedOut(e164)) {
    return { ok: false, provider: 'none', suppressed: true, error: 'Recipient opted out' }
  }

  // 1) Per-tenant Twilio sender, if active.
  if (userId) {
    const sender = await getTenantSmsSender(userId)
    if (sender?.status === 'active' && (sender.messagingServiceSid || sender.phoneNumber)) {
      const r = await sendViaTwilio(e164, body, {
        messagingServiceSid: sender.messagingServiceSid,
        from: sender.phoneNumber,
      })
      if (r.ok) return { ok: true, provider: 'twilio' }
      // Carrier-level opt-out: record it and stop — never route around STOP.
      if (r.code && OPT_OUT_CODES.has(r.code)) {
        await kv.sadd('sms:optout', e164).catch(() => {})
        return { ok: false, provider: 'none', suppressed: true, error: r.error }
      }
      // Otherwise don't silently drop the reminder — fall back to the shared sender.
      console.error(`Twilio send failed for user ${userId}, falling back to shared sender:`, r.error)
    }
  }

  // 2) Shared platform Twilio toll-free number (default for everyone without
  //    their own active number).
  const shared = await getSharedSmsSender()
  if (shared && (shared.messagingServiceSid || shared.phoneNumber)) {
    const r = await sendViaTwilio(e164, body, {
      messagingServiceSid: shared.messagingServiceSid,
      from: shared.phoneNumber,
    })
    if (r.ok) return { ok: true, provider: 'twilio' }
    if (r.code && OPT_OUT_CODES.has(r.code)) {
      await kv.sadd('sms:optout', e164).catch(() => {})
      return { ok: false, provider: 'none', suppressed: true, error: r.error }
    }
    console.error('Shared Twilio send failed, falling back to TextMagic:', r.error)
  }

  // 3) Legacy TextMagic fallback (until the shared Twilio number is live).
  const ok = await sendViaTextMagic(tenDigit, body)
  return { ok, provider: ok ? 'textmagic' : 'none' }
}

async function isOptedOut(e164: string): Promise<boolean> {
  try {
    return (await kv.sismember('sms:optout', e164)) === 1
  } catch {
    return false
  }
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
