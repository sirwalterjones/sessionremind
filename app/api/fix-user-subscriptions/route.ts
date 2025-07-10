import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    // Only allow admin users to run this fix
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    // Get all user IDs
    const allKeys = await kv.keys('user:*')
    const userKeys = allKeys.filter(key => 
      key.startsWith('user:') && 
      !key.includes(':password') && 
      !key.includes(':email')
    )

    let updatedCount = 0
    const updatedUsers = []

    // Update each user
    for (const userKey of userKeys) {
      const user = await kv.hgetall(userKey)
      
      if (user && user.subscription_tier === 'professional' && user.subscription_status !== 'active') {
        await kv.hset(userKey, {
          subscription_status: 'active'
        })
        
        updatedCount++
        updatedUsers.push({
          id: user.id,
          username: user.username,
          email: user.email,
          previousStatus: user.subscription_status
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} users to active status`,
      updatedUsers,
      totalUsersChecked: userKeys.length
    })

  } catch (error) {
    console.error('Fix user subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 