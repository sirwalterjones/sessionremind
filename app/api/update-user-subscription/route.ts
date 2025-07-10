import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update user's subscription status to active if they have professional tier
    if (currentUser.subscription_tier === 'professional') {
      await kv.hset(`user:${currentUser.id}`, {
        subscription_status: 'active'
      })
      
      return NextResponse.json({ 
        message: 'Subscription status updated to active',
        user: { ...currentUser, subscription_status: 'active' }
      })
    }

    return NextResponse.json({ 
      message: 'No update needed',
      user: currentUser
    })

  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}