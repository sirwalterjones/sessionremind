import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: billing status must never be self-granted. Subscription status is
    // owned by the signature-verified Stripe webhook (and admin tooling) only.
    // A user may NOT flip their own record to 'active' — that previously let any
    // logged-in account self-grant paid access. This endpoint is now a no-op for
    // non-admins (the client calls it best-effort and ignores failures).
    if (!currentUser.is_admin) {
      return NextResponse.json(
        { message: 'No update performed', user: currentUser },
        { status: 200 }
      )
    }

    await kv.hset(`user:${currentUser.id}`, { subscription_status: 'active' })
    return NextResponse.json({
      message: 'Subscription status updated to active',
      user: { ...currentUser, subscription_status: 'active' },
    })

  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}