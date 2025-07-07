import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const { userId, subscriptionStatus } = await request.json()
    
    if (!userId || !subscriptionStatus) {
      return NextResponse.json(
        { error: 'userId and subscriptionStatus required' },
        { status: 400 }
      )
    }

    // Get current user data
    const user = await kv.hgetall(`user:${userId}`)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update subscription status
    const updatedUser = {
      ...user,
      subscription_status: subscriptionStatus
    }
    
    await kv.hset(`user:${userId}`, updatedUser as unknown as Record<string, unknown>)
    
    return NextResponse.json({
      success: true,
      message: 'User subscription status updated',
      userId: userId,
      newStatus: subscriptionStatus
    })

  } catch (error) {
    console.error('Update user subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to update user subscription' },
      { status: 500 }
    )
  }
}