// Shared "connect a UseSession account" logic, used by both:
//  - POST /api/usesession/connect       (authed, token pasted into the app)
//  - POST /api/usesession/connect-token (cross-origin, paired via a one-time code)
//
// Validates the token, stores it encrypted, auto-fills the studio name from the
// photographer's UseSession business name, and runs an initial sync.

import { getUserSettings, patchUserSettings, setUseSessionToken } from './settings'
import { syncUserBookings } from './sync'
import { discoverListField, fetchViewer } from './usesession'
import { SyncResult } from './sync'

export interface ConnectResult {
  businessName: string
  studioName: string
  sync: SyncResult
}

export async function connectUseSession(
  userId: string,
  username: string,
  token: string
): Promise<ConnectResult> {
  // Throws if the token is invalid/expired.
  const viewer = await fetchViewer(token)

  await setUseSessionToken(userId, token)
  const listField = await discoverListField(token)
  const settings = await getUserSettings(userId, username)

  // Only auto-fill the studio name if the user hasn't set a custom one.
  const looksDefault =
    !settings.studioName || settings.studioName === 'your studio' || settings.studioName === username
  const studioName = looksDefault ? viewer.businessName || username : settings.studioName

  await patchUserSettings(
    userId,
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
    username
  )

  const sync = await syncUserBookings(userId)
  return { businessName: viewer.businessName, studioName, sync }
}
