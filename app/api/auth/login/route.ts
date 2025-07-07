import { NextRequest, NextResponse } from 'next/server'
import { verifyUser, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

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
        is_admin: user.is_admin,
        subscription_status: user.subscription_status || 'pending'
      } }
    )
    
    response.headers.set('Set-Cookie', setSessionCookie(sessionId))
    
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}