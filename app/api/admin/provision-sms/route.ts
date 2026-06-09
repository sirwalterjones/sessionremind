import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { kv } from '@vercel/kv'
import { getUserSettings, getTenantBusiness, getTenantSmsSender } from '@/lib/settings'
import { provisionTollFree, refreshVerificationStatus } from '@/lib/provisioning'

// Admin-only. The money step: buys a toll-free number, creates a Messaging
// Service, and submits a toll-free verification for the given tenant. Also
// supports refreshing a pending verification's status from Twilio.
//
// Body: { userId, action: 'provision' | 'refresh' }

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { userId?: string; action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const userId = String(body.userId || '')
  const action = body.action || 'provision'
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (action === 'refresh') {
    const result = await refreshVerificationStatus(userId)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  if (action === 'provision') {
    const userRec = await kv.hgetall<Record<string, any>>(`user:${userId}`)
    if (!userRec) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const settings = await getUserSettings(userId, userRec.username || '')
    const result = await provisionTollFree(userId, settings.studioName || userRec.username || 'Studio')
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// Admin-only read: current provisioning state + business details for a tenant.
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = request.nextUrl.searchParams.get('userId') || ''
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const [sender, business] = await Promise.all([
    getTenantSmsSender(userId),
    getTenantBusiness(userId),
  ])
  return NextResponse.json({ sender, business })
}
