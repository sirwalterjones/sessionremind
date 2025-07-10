import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status || 'active',
        sms_usage: user.sms_usage || 0,
        sms_limit: user.sms_limit || 500,
        is_admin: user.is_admin || false,
        payment_override: user.payment_override || false,
        stripe_customer_id: user.stripe_customer_id || null
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}