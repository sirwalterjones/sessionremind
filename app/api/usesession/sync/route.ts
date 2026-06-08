import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSettings } from '@/lib/settings'
import { syncUserBookings } from '@/lib/sync'

// POST — manually trigger a sync for the current user ("Sync now" button).
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await syncUserBookings(user.id)
  const status = result.ok ? 200 : 400
  return NextResponse.json(result, { status })
}

// GET — connection + last-sync status for the current user.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const settings = await getUserSettings(user.id, user.username)
  return NextResponse.json({ usesession: settings.usesession })
}
