import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getSharedSmsSender, setSharedSmsSender } from '@/lib/settings'

// Admin-only. The shared platform toll-free number that every studio sends from
// by default (until they upgrade to their own). Set it once the shared number's
// toll-free verification is approved in Twilio.
//
// GET  -> current shared sender (from KV, or env fallback)
// POST { messagingServiceSid?, phoneNumber? } -> store it (KV overrides env)

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const sender = await getSharedSmsSender()
  return NextResponse.json({ sender })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { messagingServiceSid?: string; phoneNumber?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const messagingServiceSid = (body.messagingServiceSid || '').toString().trim() || undefined
  const phoneNumber = (body.phoneNumber || '').toString().trim() || undefined
  if (!messagingServiceSid && !phoneNumber) {
    return NextResponse.json(
      { error: 'Provide a messagingServiceSid or a phoneNumber' },
      { status: 400 }
    )
  }

  await setSharedSmsSender({ messagingServiceSid, phoneNumber })
  return NextResponse.json({ success: true, sender: await getSharedSmsSender() })
}
