import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createPairingCode } from '@/lib/pairing'

// POST — generate a short-lived pairing code for the current user. The Connect
// page embeds this code in the one-time "Connect" bookmarklet.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { code, ttl } = await createPairingCode(user.id)
  return NextResponse.json({ code, ttl })
}
