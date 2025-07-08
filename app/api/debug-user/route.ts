import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    return NextResponse.json({
      user: user || null,
      hasUser: !!user,
      isAdmin: user?.is_admin || false,
      subscriptionStatus: user?.subscription_status || 'unknown',
      email: user?.email || 'none',
      env: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasKv: !!process.env.KV_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      user: null,
      env: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasKv: !!process.env.KV_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  }
}