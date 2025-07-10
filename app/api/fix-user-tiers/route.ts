import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    // Get all user IDs from the email index pattern
    const emailKeys = await kv.keys('user:email:*')
    let updatedUsers = 0
    let totalUsers = 0
    
    for (const emailKey of emailKeys) {
      const userId = await kv.get(emailKey)
      if (userId) {
        totalUsers++
        const userData = await kv.hgetall(`user:${userId}`)
        if (userData) {
          // Check if user has old tier values
          const currentTier = userData.subscription_tier
          if (currentTier !== 'professional') {
            // Update to professional tier
            await kv.hset(`user:${userId}`, {
              subscription_tier: 'professional',
              subscription_status: userData.subscription_status || 'active'
            })
            updatedUsers++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedUsers} users out of ${totalUsers} total users`,
      updatedUsers,
      totalUsers
    })

  } catch (error) {
    console.error('Fix user tiers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 