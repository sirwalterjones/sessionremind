import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's current SMS data
    const userData = await kv.hgetall(`user:${currentUser.id}`)
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const smsUsage = Number(userData.sms_usage) || 0
    const smsLimit = Number(userData.sms_limit) || (userData.is_admin ? 999999 : 500)
    const remainingSms = userData.is_admin ? 999999 : Math.max(0, smsLimit - smsUsage)
    const usagePercentage = userData.is_admin ? 0 : Math.round((smsUsage / smsLimit) * 100)

    // Calculate estimated costs (TextMagic rate: ~$0.049 per SMS)
    const estimatedCost = smsUsage * 0.049
    const averageCostPerSms = 0.049

    // Calculate usage trends (simple month-over-month estimation)
    const now = new Date()
    const currentMonth = now.getMonth()
    const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate()
    const dayOfMonth = now.getDate()
    
    // Estimate monthly usage based on current progress
    const monthlyProjection = Math.round((smsUsage / dayOfMonth) * daysInMonth)
    const dailyAverage = Math.round(smsUsage / dayOfMonth)

    // Usage status and recommendations
    let usageStatus = 'good'
    let recommendation = 'Your SMS usage is within normal limits.'
    
    if (usagePercentage >= 90) {
      usageStatus = 'critical'
      recommendation = 'You are approaching your SMS limit. Consider upgrading or monitoring usage closely.'
    } else if (usagePercentage >= 75) {
      usageStatus = 'warning'
      recommendation = 'You have used most of your SMS allowance this month.'
    } else if (usagePercentage >= 50) {
      usageStatus = 'moderate'
      recommendation = 'You are halfway through your monthly SMS allowance.'
    }

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        subscriptionTier: userData.subscription_tier || 'professional',
        isAdmin: userData.is_admin || false
      },
      smsAnalytics: {
        // Current usage
        current: {
          smsUsage,
          smsLimit: userData.is_admin ? 'unlimited' : smsLimit,
          remainingSms: userData.is_admin ? 'unlimited' : remainingSms,
          usagePercentage: userData.is_admin ? 0 : usagePercentage
        },
        
        // Cost analysis
        costs: {
          totalSpent: estimatedCost.toFixed(2),
          averageCostPerSms: averageCostPerSms.toFixed(3),
          currency: 'USD'
        },
        
        // Usage trends
        trends: {
          dailyAverage,
          monthlyProjection: userData.is_admin ? 'unlimited' : monthlyProjection,
          daysRemainingInMonth: daysInMonth - dayOfMonth
        },
        
        // Status and recommendations
        status: {
          level: usageStatus,
          recommendation,
          isApproachingLimit: usagePercentage >= 75 && !userData.is_admin
        }
      },
      planDetails: {
        name: 'Professional Plan',
        monthlyPrice: 20,
        smsLimit: userData.is_admin ? 'unlimited' : 500,
        features: [
          'SMS reminders for photography sessions',
          'UseSession.com integration',
          'Automated scheduling',
          'Professional support'
        ]
      }
    })

  } catch (error) {
    console.error('User SMS analytics error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 