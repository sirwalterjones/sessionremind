import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, newPassword } = await request.json()

    // Validate input
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Get user to update
    const userToUpdate = await kv.hgetall(`user:${userId}`)
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password (store in separate key like other auth functions)
    await kv.set(`user:${userId}:password`, hashedPassword)
    
    // Update user timestamp
    await kv.hset(`user:${userId}`, {
      updated_at: new Date().toISOString()
    })

    // Log the password reset (for audit purposes)
    console.log(`Admin ${currentUser.username} reset password for user ${userToUpdate.username} (${userToUpdate.email})`)

    return NextResponse.json({
      message: 'Password reset successfully',
      user: {
        id: userId,
        username: userToUpdate.username,
        email: userToUpdate.email
      }
    })

  } catch (error) {
    console.error('Admin password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 