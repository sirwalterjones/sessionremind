import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getUserById, hashPassword, deleteAllUserSessions } from '@/lib/auth'
import { consumeResetToken } from '@/lib/password-reset'

// Complete a password reset: trade a valid single-use token for a new password.
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const userId = await consumeResetToken(token)
    if (!userId) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Request a new one.' },
        { status: 400 }
      )
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Password hashes live at user:<id>:password (what login verifies against).
    const passwordHash = await hashPassword(password)
    await kv.set(`user:${userId}:password`, passwordHash)

    // Revoke any existing sessions so a reset locks out anyone who had access.
    await deleteAllUserSessions(userId).catch(() => {})

    return NextResponse.json({ message: 'Password updated. You can sign in now.' })
  } catch (error) {
    console.error('Reset-password confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
