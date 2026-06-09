import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSettings, getTenantBusiness } from '@/lib/settings'
import { provisionTollFree, refreshVerificationStatus } from '@/lib/provisioning'

// Self-serve: a subscribed photographer creates their own dedicated texting
// number. This is the MONEY step (buys a ~$2/mo toll-free number + submits a
// carrier verification). provisionTollFree() takes an atomic per-user lock, so
// no lock is needed here.
//
// Eligibility requires a REAL paid Stripe subscription — stripe_subscription_id
// is only ever written by the signature-verified Stripe webhook, so the KV
// `subscription_status` flag (which every account defaults to 'active') cannot
// be used to self-grant a paid number.

function canProvision(user: any): boolean {
  if (user?.is_admin || user?.payment_override) return true
  return Boolean(user?.stripe_subscription_id) && user?.subscription_status === 'active'
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const action = body?.action || 'provision'

  if (action === 'refresh') {
    const result = await refreshVerificationStatus(user.id)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  // --- provision ---
  if (!canProvision(user)) {
    return NextResponse.json(
      { error: 'A dedicated texting number is included with an active subscription. Please subscribe first.' },
      { status: 402 }
    )
  }

  const biz = await getTenantBusiness(user.id)
  if (!biz) {
    return NextResponse.json({ error: 'Add your business details first.' }, { status: 400 })
  }

  const settings = await getUserSettings(user.id, user.username || '')
  const result = await provisionTollFree(user.id, settings.studioName || user.username || 'Studio', biz)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
