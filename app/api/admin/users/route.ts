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
          // Remove sensitive data and add calculated fields
          const { password, ...userPublicData } = userData
          
          // Add subscription status if not present
          if (!userPublicData.subscription_status) {
            userPublicData.subscription_status = 'active'
          }
          
          // Ensure numeric fields are numbers
          userPublicData.sms_usage = Number(userPublicData.sms_usage) || 0
          userPublicData.sms_limit = Number(userPublicData.sms_limit) || 0
          
          users.push(userPublicData)
        }
      }
    }

    // Calculate enhanced stats
    const totalUsers = users.length
    const activeUsers = users.filter(u => (Number(u.sms_usage) || 0) > 0).length
    const totalSmsUsage = users.reduce((sum, u) => sum + (Number(u.sms_usage) || 0), 0)
    
    // Calculate revenue based on subscription tiers
    const tierPricing: Record<string, number> = {
      'enterprise': 50,
      'pro': 30,
      'starter': 20
    }
    
    const totalRevenue = users
      .filter(u => !u.is_admin && u.subscription_status === 'active')
      .reduce((sum, u) => {
        const tier = (u.subscription_tier as string)?.toLowerCase() || 'starter'
        return sum + (tierPricing[tier] || 20)
      }, 0)

    // Calculate subscription breakdown
    const subscriptionBreakdown = users
      .filter(u => !u.is_admin)
      .reduce((acc: Record<string, number>, u) => {
        const tier = (u.subscription_tier as string)?.toLowerCase() || 'starter'
        acc[tier] = (acc[tier] || 0) + 1
        return acc
      }, {})

    // SMS usage by tier
    const smsUsageByTier = users
      .filter(u => !u.is_admin)
      .reduce((acc: Record<string, number>, u) => {
        const tier = (u.subscription_tier as string)?.toLowerCase() || 'starter'
        acc[tier] = (acc[tier] || 0) + (Number(u.sms_usage) || 0)
        return acc
      }, {})

    // Top SMS users (non-admin)
    const topSmsUsers = users
      .filter(u => !u.is_admin)
      .sort((a, b) => (Number(b.sms_usage) || 0) - (Number(a.sms_usage) || 0))
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        sms_usage: Number(u.sms_usage) || 0,
        subscription_tier: u.subscription_tier
      }))

    // Calculate revenue metrics
    const subscriberCount = users.filter(u => !u.is_admin && u.subscription_status === 'active').length
    const averageRevenuePerUser = subscriberCount > 0 ? totalRevenue / subscriberCount : 0
    const estimatedAnnualRevenue = totalRevenue * 12
    
    // Mock some additional metrics that would come from payment processor
    const mockMetrics = {
      monthlyGrowthRate: 15.3,
      churnRate: 5.2,
      customerLifetimeValue: averageRevenuePerUser * 24, // 2 years average
      conversionRate: 12.5,
      averageSessionLength: 45 // minutes
    }

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        totalRevenue,
        totalSmsUsage,
        activeUsers,
        subscriberCount,
        averageRevenuePerUser,
        estimatedAnnualRevenue
      },
      analytics: {
        subscriptionBreakdown,
        smsUsageByTier,
        topSmsUsers,
        revenueMetrics: {
          monthlyRecurringRevenue: totalRevenue,
          annualRecurringRevenue: estimatedAnnualRevenue,
          averageRevenuePerUser,
          customerLifetimeValue: mockMetrics.customerLifetimeValue,
          monthlyGrowthRate: mockMetrics.monthlyGrowthRate,
          churnRate: mockMetrics.churnRate
        },
        smsMetrics: {
          totalSent: totalSmsUsage,
          thisMonth: Math.floor(totalSmsUsage * 0.3), // Mock current month
          lastMonth: Math.floor(totalSmsUsage * 0.25), // Mock last month
          dailyAverage: Math.floor(totalSmsUsage * 0.3 / 30),
          successRate: 98.5,
          byTier: smsUsageByTier
        }
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