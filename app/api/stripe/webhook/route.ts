import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { kv } from '@vercel/kv'
import Stripe from 'stripe'
import { mapStripeStatus, resolveUserId } from '@/lib/subscriptions'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Idempotency — process each Stripe event id at most once (24h window).
    // kv.set with nx returns null if the key already exists.
    const fresh = await kv.set(`stripe:event:${event.id}`, '1', { nx: true, ex: 86400 })
    if (fresh === null) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const userId = await resolveUserId(customerId, session.metadata?.userId)
        if (userId) {
          await kv.hset(`user:${userId}`, {
            stripe_customer_id: customerId,
            subscription_status: 'active',
            subscription_tier: 'professional',
          })
          console.log(`Webhook: user ${userId} activated via checkout`)
        } else {
          console.error('Webhook: could not resolve user for checkout', { customerId, sessionId: session.id })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(sub.customer as string)
        if (userId) {
          await kv.hset(`user:${userId}`, {
            subscription_status: mapStripeStatus(sub.status),
            subscription_tier: 'professional',
            stripe_subscription_id: sub.id,
          })
          console.log(`Webhook: user ${userId} subscription -> ${mapStripeStatus(sub.status)}`)
        } else {
          console.error('Webhook: could not resolve user for subscription', { customerId: sub.customer })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(sub.customer as string)
        if (userId) await kv.hset(`user:${userId}`, { subscription_status: 'canceled' })
        break
      }

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const userId = await resolveUserId(invoice.customer as string)
        if (userId) {
          await kv.hset(`user:${userId}`, {
            subscription_status: event.type === 'invoice.payment_succeeded' ? 'active' : 'past_due',
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
