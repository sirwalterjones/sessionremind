import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: Request) {
  try {
    const { userId, secret } = await request.json()
    
    // Simple secret check (you should use a proper secret)
    if (secret !== 'admin-setup-secret-123') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
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

    // Update with admin flags
    const adminUser = {
      ...user,
      is_admin: true,
      subscription_tier: 'enterprise',
      sms_limit: 999999,
      stripe_customer_id: null,
      subscription_status: 'active'
    }
    
    await kv.hset(`user:${userId}`, adminUser as unknown as Record<string, unknown>)
    
    return NextResponse.json({
      success: true,
      message: 'User updated to admin successfully',
      userId: userId
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to update user to admin' },
      { status: 500 }
    )
  }
}