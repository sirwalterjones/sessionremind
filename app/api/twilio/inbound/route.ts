import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import twilio from 'twilio'

// Inbound SMS webhook for tenant numbers. Twilio's Messaging Service
// Advanced Opt-Out already intercepts STOP/HELP and stops future sends at the
// carrier level, so we don't need to reply here. We additionally record opt-outs
// in KV so our own sending logic can suppress them defensively, then return an
// empty TwiML document (a 200 with no message) for everything else.
//
// SECURITY: this is a public URL baked into our numbers/messaging services, and
// it mutates the shared opt-out set. We validate Twilio's X-Twilio-Signature so
// nobody can forge STOP (deliverability DoS) or START (defeat an opt-out). We
// only mutate state when the request is cryptographically verified.

const STOP_WORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit'])
const START_WORDS = new Set(['start', 'unstop', 'yes'])

function twiml(): NextResponse {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

// The URL Twilio signs is the one we configured on the number/service.
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'}/api/twilio/inbound`

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const params: Record<string, string> = {}
    form.forEach((v, k) => {
      params[k] = String(v)
    })

    const token = process.env.TWILIO_AUTH_TOKEN
    const signature = request.headers.get('x-twilio-signature') || ''
    const valid = token ? twilio.validateRequest(token, signature, WEBHOOK_URL, params) : false
    if (!valid) {
      // Reject forged/unverifiable requests rather than mutating state from them.
      if (!token) console.error('Twilio inbound: TWILIO_AUTH_TOKEN not set; cannot verify signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const from = (params.From || '').trim() // E.164 of the client
    const firstWord = (params.Body || '').trim().toLowerCase().split(/\s+/)[0] || ''

    if (from && STOP_WORDS.has(firstWord)) {
      await kv.sadd('sms:optout', from)
    } else if (from && START_WORDS.has(firstWord)) {
      await kv.srem('sms:optout', from)
    }
  } catch (e) {
    console.error('Twilio inbound webhook error:', e)
  }
  return twiml()
}
