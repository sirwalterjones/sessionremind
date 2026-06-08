import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSettings, patchUserSettings, setUseSessionToken } from '@/lib/settings'
import { syncUserBookings } from '@/lib/sync'
import { discoverListField, fetchViewer } from '@/lib/usesession'

// POST { token } — connect a photographer's UseSession account.
// The token is validated, stored encrypted, the studio name is auto-filled from
// their UseSession business name, and an initial sync runs immediately.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let token: string
  try {
    const body = await request.json()
    token = (body?.token || '').toString().trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!token) {
    return NextResponse.json({ error: 'Missing UseSession token' }, { status: 400 })
  }

  // Validate the token by fetching the viewer.
  let viewer
  try {
    viewer = await fetchViewer(token)
  } catch (error) {
    return NextResponse.json(
      { error: 'That token did not work. Make sure you are logged into UseSession and try again.' },
      { status: 400 }
    )
  }

  await setUseSessionToken(user.id, token)
  const listField = await discoverListField(token)
  const settings = await getUserSettings(user.id, user.username)

  // Only override the studio name if the user hasn't set a custom one.
  const looksDefault =
    !settings.studioName ||
    settings.studioName === 'your studio' ||
    settings.studioName === user.username
  const studioName = looksDefault ? viewer.businessName || user.username : settings.studioName

  await patchUserSettings(
    user.id,
    {
      studioName,
      usesession: {
        ...settings.usesession,
        connected: true,
        connectedAt: new Date().toISOString(),
        businessName: viewer.businessName,
        listField: listField || undefined,
      },
    },
    user.username
  )

  // Run an initial sync so the dashboard is populated right away.
  const sync = await syncUserBookings(user.id)

  return NextResponse.json({
    success: true,
    businessName: viewer.businessName,
    studioName,
    sync,
  })
}
