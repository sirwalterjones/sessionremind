// Twilio client + send wrapper for the per-tenant (ISV) SMS model.
// Auth uses an API Key (SK.../secret) scoped to the account SID — never the
// raw Auth Token. All no-op cleanly if Twilio isn't configured.

import twilio from 'twilio'

export function twilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_API_KEY_SID &&
    process.env.TWILIO_API_KEY_SECRET &&
    process.env.TWILIO_ACCOUNT_SID
  )
}

function getClient() {
  if (!twilioConfigured()) return null
  return twilio(process.env.TWILIO_API_KEY_SID!, process.env.TWILIO_API_KEY_SECRET!, {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
  })
}

export interface TwilioSender {
  // Prefer a Messaging Service (handles 10DLC routing); fall back to a raw number.
  messagingServiceSid?: string
  from?: string
}

export async function sendViaTwilio(
  to: string,
  body: string,
  sender: TwilioSender
): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const client = getClient()
  if (!client) return { ok: false, error: 'Twilio not configured' }
  if (!sender.messagingServiceSid && !sender.from) {
    return { ok: false, error: 'No Twilio sender (messagingServiceSid or from) configured' }
  }
  try {
    const opts: Record<string, string> = { to, body }
    if (sender.messagingServiceSid) opts.messagingServiceSid = sender.messagingServiceSid
    else if (sender.from) opts.from = sender.from
    const msg = await client.messages.create(opts as any)
    return { ok: true, sid: msg.sid }
  } catch (e: any) {
    console.error('Twilio send failed:', e?.message || e)
    return { ok: false, error: e?.message || String(e) }
  }
}
