import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Inbound SMS webhook for tenant numbers. Twilio's Messaging Service
// Advanced Opt-Out already intercepts STOP/HELP and stops future sends at the
// carrier level, so we don't need to reply here. We additionally record opt-outs
// in KV so our own sending logic can suppress them defensively, then return an
// empty TwiML document (a 200 with no message) for everything else.

const STOP_WORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit'])
const START_WORDS = new Set(['start', 'unstop', 'yes'])

function twiml(): NextResponse {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const from = String(form.get('From') || '').trim() // E.164 of the client
    const body = String(form.get('Body') || '').trim().toLowerCase()
    const firstWord = body.split(/\s+/)[0] || ''

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
