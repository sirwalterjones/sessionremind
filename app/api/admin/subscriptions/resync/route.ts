import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { resyncUserSubscription, ResyncResult } from '@/lib/subscriptions'
import { kv } from '@vercel/kv'

// Admin-only. Reconcile KV subscription status from the live Stripe record.
// Body: { userId } for one user, or { all: true } for every user with a Stripe
// customer (error-isolated, capped). Replaces the blind fix-* sweeps with the
// real Stripe status.

const MAX_ALL = 500

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { userId?: string; all?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (body.userId) {
    try {
      const result = await resyncUserSubscription(String(body.userId))
      return NextResponse.json({ result })
    } catch (e: any) {
      console.error('resync (single) failed:', e)
      return NextResponse.json({ error: e?.message || 'Resync failed' }, { status: 500 })
    }
  }

  if (body.all) {
    const emailKeys = await kv.keys('user:email:*')
    const results: ResyncResult[] = []
    let changed = 0
    let processed = 0
    for (const ek of emailKeys) {
      if (processed >= MAX_ALL) break
      const userId = await kv.get<string>(ek)
      if (!userId) continue
      const u = await kv.hgetall<Record<string, any>>(`user:${userId}`)
      if (!u || !u.stripe_customer_id) continue // only users with a Stripe customer
      processed++
      try {
        const r = await resyncUserSubscription(userId)
        if (r.changed) changed++
        results.push(r)
      } catch (e: any) {
        results.push({
          userId,
          email: u.email,
          before: u.subscription_status || null,
          stripeStatus: null,
          after: u.subscription_status || null,
          changed: false,
          note: `error: ${e?.message || e}`,
        })
      }
    }
    return NextResponse.json({ processed, changed, results })
  }

  return NextResponse.json({ error: 'Provide userId or all:true' }, { status: 400 })
}
