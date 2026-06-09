import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createVerifyToken } from '@/lib/email-verify'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((user as { email_verified?: boolean }).email_verified === true) {
    return NextResponse.json({ alreadyVerified: true })
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
