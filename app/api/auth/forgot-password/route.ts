import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth'
import { verifyTurnstile } from '@/lib/turnstile'
import { createResetToken } from '@/lib/password-reset'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit'

// Request a password-reset link. Always answers with the same generic message
// so the endpoint can't be used to probe which emails have accounts.
export async function POST(request: NextRequest) {
  try {
    const { email, turnstileToken } = await request.json()

    const ip = clientIp(request)
    const human = await verifyTurnstile(turnstileToken, ip)
    if (!human) {
      return NextResponse.json(
        { error: 'Please complete the verification challenge and try again.' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Cap reset emails per IP and per address (1-hour window) so a solved
    // challenge can't be looped to inbox-bomb a victim.
    const ipLimit = await rateLimit(`forgot:rl:ip:${ip}`, 5, 3600)
    const acctLimit = await rateLimit(`forgot:rl:acct:${email.trim().toLowerCase()}`, 3, 3600)
    if (!ipLimit.ok || !acctLimit.ok) {
      return tooManyRequests(
        'Too many reset requests. Please wait a bit before trying again.',
        Math.max(ipLimit.retryAfterSeconds, acctLimit.retryAfterSeconds)
      )
    }

    // The email index is case-exact (login does no normalization), so try the
    // address as typed first, then a lowercased fallback.
    const user =
      (await getUserByEmail(email.trim())) ||
      (await getUserByEmail(email.trim().toLowerCase()))
    if (user) {
      const token = await createResetToken(user.id)
      const base =
        request.headers.get('origin') ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        'https://sessionremind.com'
      await sendPasswordResetEmail(user.email, `${base}/reset-password?token=${token}`)
    }

    return NextResponse.json({
      message: 'If an account exists for that email, a reset link is on its way.',
    })
  } catch (error) {
    console.error('Forgot-password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
