import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()
    
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 })
    }

    // Get user data from storage
    const userData = await kv.get(`user:${user.id}`)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRecord = userData as any

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userRecord.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await kv.set(`user:${user.id}`, {
      ...userRecord,
      password: hashedNewPassword,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({ message: 'Password updated successfully' })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 