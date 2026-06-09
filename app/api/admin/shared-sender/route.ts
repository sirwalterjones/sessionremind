import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getSharedSmsSender, getTenantSmsSender, setSharedSmsSender, TenantBusiness } from '@/lib/settings'
import {
  PLATFORM_SHARED_USER_ID,
  provisionSharedNumber,
  refreshVerificationStatus,
} from '@/lib/provisioning'

// Admin-only. The shared platform toll-free number that every studio sends from
// by default (until they upgrade to their own).
//
// GET  -> current shared sender (KV/env) + provisioning state
// POST { action }:
//   'provision' { business }       -> buy + verify the shared toll-free number ($)
//   'refresh'                      -> re-check the verification with Twilio
//   'set' { messagingServiceSid?, phoneNumber? } -> manually point at a number

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const [sender, state] = await Promise.all([
    getSharedSmsSender(),
    getTenantSmsSender(PLATFORM_SHARED_USER_ID),
  ])
  return NextResponse.json({ sender, state })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const action = body?.action || (body?.messagingServiceSid || body?.phoneNumber ? 'set' : '')

  // --- Provision the shared number (the money step) ---
  if (action === 'provision') {
    const b = body?.business || {}
    const required = ['legalName', 'website', 'addressStreet', 'addressCity', 'addressState', 'addressZip', 'contactFirstName', 'contactLastName', 'contactEmail', 'contactPhone']
    const missing = required.filter((k) => !String(b?.[k] || '').trim())
    if (missing.length) {
      return NextResponse.json({ error: `Missing business fields: ${missing.join(', ')}` }, { status: 400 })
    }
    const business: TenantBusiness = {
      legalName: b.legalName,
      website: b.website,
      addressStreet: b.addressStreet,
      addressCity: b.addressCity,
      addressState: b.addressState,
      addressZip: b.addressZip,
      addressCountry: b.addressCountry || 'US',
      contactFirstName: b.contactFirstName,
      contactLastName: b.contactLastName,
      contactEmail: b.contactEmail,
      contactPhone: b.contactPhone,
    }
    const result = await provisionSharedNumber(business)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  // --- Re-check the shared verification with Twilio ---
  if (action === 'refresh') {
    const result = await refreshVerificationStatus(PLATFORM_SHARED_USER_ID)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  // --- Manually point the shared sender at an existing number ---
  if (action === 'set') {
    const messagingServiceSid = (body.messagingServiceSid || '').toString().trim() || undefined
    const phoneNumber = (body.phoneNumber || '').toString().trim() || undefined
    if (!messagingServiceSid && !phoneNumber) {
      return NextResponse.json({ error: 'Provide a messagingServiceSid or a phoneNumber' }, { status: 400 })
    }
    await setSharedSmsSender({ messagingServiceSid, phoneNumber })
    return NextResponse.json({ success: true, sender: await getSharedSmsSender() })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
