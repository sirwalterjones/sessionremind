import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { planByKey, DEFAULT_PLAN_KEY } from '@/lib/plans'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Admin users and users with payment override don't need to pay
    if (user.is_admin || user.payment_override) {
      return NextResponse.json(
        { error: 'User already has premium access' },
        { status: 400 }
      )
    }

    // Get redirect path + chosen plan from request body.
    const body = await request.json().catch(() => ({}))
    const redirectPath = body.redirectPath || '/dashboard'
    const plan = planByKey(body.plan) || planByKey(DEFAULT_PLAN_KEY)!

    // Create Stripe customer if not exists
    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          username: user.username
        }
      })
      customerId = customer.id

      // Update user record with customer ID + the reverse index used by webhooks.
      const { kv } = await import('@vercel/kv')
      await kv.hset(`user:${user.id}`, {
        stripe_customer_id: customerId
      })
      const { setCustomerIndex } = await import('@/lib/subscriptions')
      await setCustomerIndex(customerId, user.id)
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'https://sessionreminder.com'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}${redirectPath}?payment=success`,
      cancel_url: `${origin}/payment-required?payment=cancelled&redirect=${encodeURIComponent(redirectPath)}`,
      metadata: {
        userId: user.id,
        redirectPath: redirectPath,
        plan: plan.key,
      },
      subscription_data: {
        metadata: { userId: user.id, plan: plan.key },
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}