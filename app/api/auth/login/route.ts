import { NextRequest, NextResponse } from 'next/server'
import { verifyUser, createSession, setSessionCookie } from '@/lib/auth'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const { email, password, turnstileToken } = await request.json()

    // Bot check (Cloudflare Turnstile).
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const human = await verifyTurnstile(turnstileToken, ip)
    if (!human) {
      return NextResponse.json(
        { error: 'Please complete the verification challenge and try again.' },
        { status: 400 }
      )
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Verify user credentials
    const user = await verifyUser(email, password)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    const response = NextResponse.json(
      { user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status || 'active',
        sms_usage: user.sms_usage || 0,
        sms_limit: user.sms_limit || 500,
        is_admin: user.is_admin || false,
        payment_override: user.payment_override || false,
        stripe_customer_id: user.stripe_customer_id || null
      } }
    )
    
    // Set cookie using NextResponse.cookies API
    response.cookies.set({
      name: 'session',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })
    
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}