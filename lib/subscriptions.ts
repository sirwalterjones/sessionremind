// Subscription state helpers — single source of truth for mapping Stripe's
// subscription status onto our KV `subscription_status`, and for re-syncing a
// user from the live Stripe record (used by the admin panel and, later, to
// harden the webhook).

import Stripe from 'stripe'
import { stripe } from './stripe'
import { kv } from '@vercel/kv'

export function mapStripeStatus(s: Stripe.Subscription.Status | string): string {
  switch (s) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'inactive'
  }
}

export interface ResyncResult {
  userId: string
  email?: string
  before: string | null
  stripeStatus: string | null // raw Stripe status (or 'none' / null)
  after: string | null // mapped KV status now stored
  changed: boolean
  note?: string
}

// Pull the user's live Stripe subscription and reconcile KV to match.
export async function resyncUserSubscription(userId: string): Promise<ResyncResult> {
  const user = await kv.hgetall<Record<string, any>>(`user:${userId}`)
  if (!user) {
    return { userId, before: null, stripeStatus: null, after: null, changed: false, note: 'user not found' }
  }
  const before = (user.subscription_status as string) || null
  const customerId = user.stripe_customer_id as string | undefined
  const email = user.email as string | undefined

  if (!customerId) {
    return { userId, email, before, stripeStatus: null, after: before, changed: false, note: 'no stripe customer' }
  }

  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })

  if (!subs.data.length) {
    const mapped = 'canceled'
    const changed = before !== mapped
    if (changed) await kv.hset(`user:${userId}`, { subscription_status: mapped })
    return { userId, email, before, stripeStatus: 'none', after: mapped, changed, note: 'no subscriptions on customer' }
  }

  // Prefer a live (active/trialing/past_due/unpaid) sub; else the most recent.
  const ranked = subs.data.slice().sort((a, b) => b.created - a.created)
  const chosen =
    ranked.find((s) => ['active', 'trialing', 'past_due', 'unpaid'].includes(s.status)) || ranked[0]
  const mapped = mapStripeStatus(chosen.status)

  const changed = before !== mapped || user.stripe_subscription_id !== chosen.id
  if (changed) {
    await kv.hset(`user:${userId}`, { subscription_status: mapped, stripe_subscription_id: chosen.id })
  }
  return { userId, email, before, stripeStatus: chosen.status, after: mapped, changed }
}
