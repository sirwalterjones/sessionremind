import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Always use the authenticated user's OWN customer id — never a
    // client-supplied one (which would expose other people's billing).
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const customerId = (user as { stripe_customer_id?: string | null }).stripe_customer_id
    if (!customerId) {
      return NextResponse.json({ error: 'No active subscription on this account.' }, { status: 400 })
    }

    const base =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://sessionremind.com'

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/profile`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Stripe customer portal error:', error)
    return NextResponse.json({ error: 'Failed to create customer portal session' }, { status: 500 })
  }
} 