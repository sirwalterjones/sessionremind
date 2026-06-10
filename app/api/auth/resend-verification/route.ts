import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createVerifyToken } from '@/lib/email-verify'
import { sendVerificationEmail } from '@/lib/email'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((user as { email_verified?: boolean }).email_verified === true) {
    return NextResponse.json({ alreadyVerified: true })
  }

  // Cap resends per account so a logged-in user can't loop the verification
  // email (Resend cost + sender-reputation hit). 5 per hour.
  const limit = await rateLimit(`resendverify:rl:${user.id}`, 5, 3600)
  if (!limit.ok) {
    return tooManyRequests(
      'You’ve requested several verification emails. Please wait an hour and check your inbox/spam.',
      limit.retryAfterSeconds
    )
  }

  const token = await createVerifyToken(user.id)
  const base = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'
  const ok = await sendVerificationEmail(user.email, `${base}/api/auth/verify-email?token=${token}`)
  if (!ok) {
    return NextResponse.json(
      { error: 'Could not send the email. Email may not be configured yet.' },
      { status: 500 }
    )
  }
  return NextResponse.json({ sent: true })
}
