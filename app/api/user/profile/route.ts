import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createVerifyToken } from '@/lib/email-verify'
import { sendVerificationEmail } from '@/lib/email'
import { kv } from '@vercel/kv'

// Self-service profile update — the current user edits their own username/email.
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const username = (body?.username || '').toString().trim()
  const email = (body?.email || '').toString().trim().toLowerCase()
  const patch: Record<string, any> = {}
  let emailChanged = false

  if (username) patch.username = username.slice(0, 80)

  if (email && email !== user.email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    const existing = await kv.get<string>(`user:email:${email}`)
    if (existing && existing !== user.id) {
      return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 })
    }
    // Move the email index and require re-verification of the new address.
    await kv.del(`user:email:${user.email}`)
    await kv.set(`user:email:${email}`, user.id)
    patch.email = email
    patch.email_verified = false
    emailChanged = true
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } })
  }

  await kv.hset(`user:${user.id}`, patch)

  // If the email changed, send a fresh verification link to the new address.
  if (emailChanged) {
    try {
      const token = await createVerifyToken(user.id)
      const base = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'
      await sendVerificationEmail(email, `${base}/api/auth/verify-email?token=${token}`)
    } catch (e) {
      console.error('profile update: verification email failed', e)
    }
  }

  const updated = await kv.hgetall<Record<string, any>>(`user:${user.id}`)
  return NextResponse.json({
    success: true,
    emailChanged,
    user: {
      id: user.id,
      username: updated?.username,
      email: updated?.email,
    },
  })
}
