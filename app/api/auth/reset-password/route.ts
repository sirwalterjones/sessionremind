import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
  deleteAllUserSessions,
  createSession,
  setSessionCookie,
} from '@/lib/auth'

// Logged-in password change (used from /profile). Password hashes live at
// user:<id>:password — the same key login verifies against. (This route
// previously read the user record with kv.get and rewrote it as a JSON blob,
// which throws WRONGTYPE against the hash-stored user records.)
export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 }
      )
    }

    const storedHash = await kv.get(`user:${user.id}:password`)
    if (!storedHash) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, storedHash as string)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    await kv.set(`user:${user.id}:password`, await hashPassword(newPassword))

    // Revoke every existing session (logs out other devices), then mint a fresh
    // one so the current device stays signed in.
    await deleteAllUserSessions(user.id).catch(() => {})
    const sessionId = await createSession(user.id)

    const response = NextResponse.json({ message: 'Password updated successfully' })
    response.headers.set('Set-Cookie', setSessionCookie(sessionId))
    return response
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
