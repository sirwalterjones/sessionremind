import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'
import { verifyTurnstile } from '@/lib/turnstile'
import { createTicket, TicketTopic } from '@/lib/support'
import { sendSupportNotificationEmail } from '@/lib/email'

// Public contact/support form. Creates a ticket (handled in /admin/support)
// and emails the operator a heads-up. Turnstile-gated + IP rate-limited since
// it's an unauthenticated endpoint that sends email.

const TOPICS: TicketTopic[] = ['support', 'billing', 'bug', 'general']
const MAX_PER_HOUR = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = String(body.name || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 160)
    const topic: TicketTopic = TOPICS.includes(body.topic) ? body.topic : 'general'
    const message = String(body.message || '').trim().slice(0, 4000)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill in your name, email, and message.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'That email address doesn’t look right.' }, { status: 400 })
    }

    // Bot check.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const human = await verifyTurnstile(body.turnstileToken, ip)
    if (!human) {
      return NextResponse.json(
        { error: 'Please complete the verification challenge and try again.' },
        { status: 400 }
      )
    }

    // Rate limit per IP (defense-in-depth behind Turnstile).
    const rlKey = `contact:rl:${ip}`
    const count = await kv.incr(rlKey)
    if (count === 1) await kv.expire(rlKey, 3600)
    if (count > MAX_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many messages from this connection — please try again in an hour.' },
        { status: 429 }
      )
    }

    // Attach the account if they're logged in (helps the admin).
    const user = await getCurrentUser(request).catch(() => null)

    const ticket = await createTicket({
      name,
      email,
      topic,
      message,
      userId: user?.id,
      username: user?.username,
    })

    // Heads-up email is best-effort — the ticket is already saved.
    sendSupportNotificationEmail(ticket).catch((e) =>
      console.error('support notification email failed:', e)
    )

    return NextResponse.json({ ok: true, id: ticket.id })
  } catch (error) {
    console.error('contact error:', error)
    return NextResponse.json({ error: 'Something went wrong — please try again.' }, { status: 500 })
  }
}
