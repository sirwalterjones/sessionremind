import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { customer_id } = await request.json()
    
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate input
    if (!customer_id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Create Stripe customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`, // Return to profile page
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Stripe customer portal error:', error)
    return NextResponse.json({ error: 'Failed to create customer portal session' }, { status: 500 })
  }
} 