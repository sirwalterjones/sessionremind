import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { clearUseSessionToken, getUserSettings, patchUserSettings } from '@/lib/settings'

// POST — disconnect UseSession: delete the stored token and mark disconnected.
// Already-scheduled reminders are left intact.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await clearUseSessionToken(user.id)
  const settings = await getUserSettings(user.id, user.username)
  await patchUserSettings(
    user.id,
    { usesession: { ...settings.usesession, connected: false, listField: undefined } },
    user.username
  )
  return NextResponse.json({ success: true })
}
