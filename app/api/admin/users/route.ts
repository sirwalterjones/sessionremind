import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all user IDs from the email index pattern
    const emailKeys = await kv.keys('user:email:*')
    const users = []
    
    for (const emailKey of emailKeys) {
      const userId = await kv.get(emailKey)
      if (userId) {
        const userData = await kv.hgetall(`user:${userId}`)
        if (userData) {
          // Remove sensitive data
          const { ...userPublicData } = userData
          users.push(userPublicData)
        }
      }
    }

    // Calculate stats
    const totalUsers = users.length
    const totalRevenue = users.filter(u => !u.is_admin).length * 20 // $20/month per non-admin user
    const totalSmsUsage = users.reduce((sum, u) => sum + (Number(u.sms_usage) || 0), 0)
    const activeUsers = users.filter(u => (Number(u.sms_usage) || 0) > 0).length

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        totalRevenue,
        totalSmsUsage,
        activeUsers
      }
    })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}