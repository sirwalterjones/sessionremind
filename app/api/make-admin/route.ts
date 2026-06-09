import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { userId, secret } = await request.json()

    // SECURITY: only an existing admin may grant admin (is_admin bypasses the
    // paid-number gate). The very first admin is seeded via lib/seed-admin, not
    // here. The shared-secret path is kept as an optional extra factor but is no
    // longer sufficient on its own.
    const caller = await getCurrentUser(request)
    if (!caller?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expected = process.env.ADMIN_SETUP_SECRET
    if (expected && secret !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      subscription_tier: 'professional',
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