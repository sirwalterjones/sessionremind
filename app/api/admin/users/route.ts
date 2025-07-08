import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, createUser, hashPassword } from '@/lib/auth'
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
          
          // Add payment override status if not present
          if (!userPublicData.payment_override) {
            userPublicData.payment_override = false
          }
          
          // Add Stripe customer ID if not present
          if (!userPublicData.stripe_customer_id) {
            userPublicData.stripe_customer_id = null
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
      .filter(u => !u.is_admin && u.subscription_status === 'active' && !u.payment_override)
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
    const paidSubscribers = users.filter(u => !u.is_admin && u.subscription_status === 'active' && !u.payment_override).length
    const overrideUsers = users.filter(u => !u.is_admin && u.payment_override).length
    const averageRevenuePerUser = paidSubscribers > 0 ? totalRevenue / paidSubscribers : 0
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
        paidSubscribers,
        overrideUsers,
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

// Create new user
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

    const { 
      username, 
      email, 
      password, 
      subscription_tier = 'starter', 
      subscription_status = 'active', 
      is_admin = false,
      payment_override = false,
      stripe_customer_id = null
    } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserId = await kv.get(`user:email:${email}`)
    if (existingUserId) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user with admin-specified settings
    const user = await createUser(username, email, password)
    
    // Update user with admin settings
    await kv.hset(`user:${user.id}`, {
      subscription_tier,
      subscription_status,
      is_admin,
      payment_override,
      stripe_customer_id,
      sms_usage: 0,
      sms_limit: subscription_tier === 'enterprise' ? 999999 : subscription_tier === 'pro' ? 1000 : 100
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        subscription_tier,
        subscription_status,
        is_admin,
        payment_override,
        stripe_customer_id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      userId, 
      username, 
      email, 
      subscription_tier, 
      subscription_status, 
      is_admin, 
      sms_limit,
      payment_override,
      stripe_customer_id 
    } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get existing user
    const existingUser = await kv.hgetall(`user:${userId}`)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== existingUser.email) {
      const emailExists = await kv.get(`user:email:${email}`)
      if (emailExists && emailExists !== userId) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
      
      // Update email index
      await kv.del(`user:email:${existingUser.email}`)
      await kv.set(`user:email:${email}`, userId)
    }

    // Prepare update data
    const updateData: Record<string, any> = {}
    
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (subscription_tier) {
      updateData.subscription_tier = subscription_tier
      // Update SMS limit based on tier if not explicitly provided
      if (!sms_limit) {
        updateData.sms_limit = subscription_tier === 'enterprise' ? 999999 : subscription_tier === 'pro' ? 1000 : 100
      }
    }
    if (subscription_status) updateData.subscription_status = subscription_status
    if (typeof is_admin === 'boolean') updateData.is_admin = is_admin
    if (typeof payment_override === 'boolean') updateData.payment_override = payment_override
    if (stripe_customer_id !== undefined) updateData.stripe_customer_id = stripe_customer_id
    if (sms_limit) updateData.sms_limit = Number(sms_limit)

    // Update user
    await kv.hset(`user:${userId}`, updateData)

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: userId,
        ...existingUser,
        ...updateData
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent deleting self
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user to delete
    const userToDelete = await kv.hgetall(`user:${userId}`)
    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user data
    await kv.del(`user:${userId}`)
    await kv.del(`user:email:${userToDelete.email}`)
    
    // Delete any sessions
    const sessionKeys = await kv.keys(`session:*`)
    for (const sessionKey of sessionKeys) {
      const session = await kv.hgetall(sessionKey)
      if (session && session.user_id === userId) {
        await kv.del(sessionKey)
      }
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}