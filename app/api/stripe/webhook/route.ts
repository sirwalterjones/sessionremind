import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { kv } from '@vercel/kv'
import Stripe from 'stripe'

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
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  if (session.metadata?.userId) {
    const userId = session.metadata.userId
    
    // Update user record with customer ID and activate subscription
    await kv.hset(`user:${userId}`, {
      stripe_customer_id: session.customer as string,
      subscription_status: 'active',
      subscription_tier: 'professional'
    })
    
    console.log(`User ${userId} subscription activated via checkout`)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  
  if (customer && !customer.deleted && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    
    await kv.hset(`user:${userId}`, {
      subscription_status: 'active',
      subscription_tier: 'professional',
      stripe_subscription_id: subscription.id
    })
    
    console.log(`User ${userId} subscription created and activated`)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  
  if (customer && !customer.deleted && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    
    let status = 'inactive'
    if (subscription.status === 'active') {
      status = 'active'
    } else if (subscription.status === 'past_due') {
      status = 'past_due'
    } else if (subscription.status === 'canceled') {
      status = 'canceled'
    }
    
    await kv.hset(`user:${userId}`, {
      subscription_status: status,
      stripe_subscription_id: subscription.id
    })
    
    console.log(`User ${userId} subscription updated to ${status}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId)
  
  if (customer && !customer.deleted && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    
    await kv.hset(`user:${userId}`, {
      subscription_status: 'canceled'
    })
    
    console.log(`User ${userId} subscription canceled`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id)
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer && !customer.deleted && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      
      await kv.hset(`user:${userId}`, {
        subscription_status: 'active'
      })
      
      console.log(`User ${userId} payment succeeded - subscription active`)
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id)
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer && !customer.deleted && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      
      await kv.hset(`user:${userId}`, {
        subscription_status: 'past_due'
      })
      
      console.log(`User ${userId} payment failed - subscription past due`)
    }
  }
} 