import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, createSession, setSessionCookie } from '@/lib/auth'
import { verifyTurnstile } from '@/lib/turnstile'
import { createVerifyToken } from '@/lib/email-verify'
import { sendVerificationEmail } from '@/lib/email'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, turnstileToken } = await request.json()

    // Bot check (Cloudflare Turnstile) before doing any work.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const human = await verifyTurnstile(turnstileToken, ip)
    if (!human) {
      return NextResponse.json(
        { error: 'Please complete the verification challenge and try again.' },
        { status: 400 }
      )
    }

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user
    const user = await createUser(username, email, password)

    // Mark unverified and send a verification email (best-effort — never blocks signup).
    await kv.hset(`user:${user.id}`, { email_verified: false })
    try {
      const token = await createVerifyToken(user.id)
      const base = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'
      await sendVerificationEmail(user.email, `${base}/api/auth/verify-email?token=${token}`)
    } catch (e) {
      console.error('register: verification email failed', e)
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    const response = NextResponse.json(
      { user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    )
    
    response.headers.set('Set-Cookie', setSessionCookie(sessionId))
    
    return response

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}