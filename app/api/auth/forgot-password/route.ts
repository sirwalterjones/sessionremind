import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth'
import { verifyTurnstile } from '@/lib/turnstile'
import { createResetToken } from '@/lib/password-reset'
import { sendPasswordResetEmail } from '@/lib/email'

// Request a password-reset link. Always answers with the same generic message
// so the endpoint can't be used to probe which emails have accounts.
export async function POST(request: NextRequest) {
  try {
    const { email, turnstileToken } = await request.json()

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
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
