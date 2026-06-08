// Orchestrates a UseSession -> reminders sync for one user or all connected users.
// Pulls upcoming bookings, builds reminders, de-dupes against what's already
// scheduled, enforces the per-user SMS quota, and records sync health.

import { getUserById } from './auth'
import { buildReminders } from './reminders'
import {
  addScheduledMessages,
  countUserMessages,
  getExistingExternalKeys,
} from './storage'
import {
  getUserSettings,
  getUseSessionToken,
  listConnectedUserIds,
  patchUserSettings,
} from './settings'
import { ScheduledMessage } from './types'
import { discoverListField, fetchUpcomingBookings } from './usesession'

export interface SyncResult {
  ok: boolean
  bookings: number
  scheduled: number
  skippedForQuota: number
  error?: string
}

export async function syncUserBookings(userId: string): Promise<SyncResult> {
  const token = await getUseSessionToken(userId)
  if (!token) {
    return { ok: false, bookings: 0, scheduled: 0, skippedForQuota: 0, error: 'UseSession not connected' }
  }

  const user = await getUserById(userId)
  const settings = await getUserSettings(userId, user?.username || '')

  try {
    // Resolve (and cache) the viewer list field on first sync.
    let listField = settings.usesession.listField || ''
    if (!listField) {
      listField = (await discoverListField(token)) || ''
      if (!listField) throw new Error('Could not resolve the UseSession session list field')
    }

    const now = new Date()
    const bookings = await fetchUpcomingBookings(token, listField, now)

    let scheduled = 0
    let skippedForQuota = 0

    if (settings.autoSchedule) {
      const existingKeys = await getExistingExternalKeys(userId)
      const smsLimit = Number(user?.sms_limit) || 500
      const used = await countUserMessages(userId)
      let remaining = Math.max(0, smsLimit - used)

      const toAdd: ScheduledMessage[] = []
      for (const booking of bookings) {
        const reminders = buildReminders(booking, settings, userId, now).filter(
          (r) => !r.externalKey || !existingKeys.has(r.externalKey)
        )
        for (const reminder of reminders) {
          if (remaining <= 0) {
            skippedForQuota++
            continue
          }
          toAdd.push(reminder)
          remaining--
        }
      }
      scheduled = await addScheduledMessages(toAdd)
    }

    await patchUserSettings(
      userId,
      {
        usesession: {
          ...settings.usesession,
          connected: true,
          listField,
          lastSyncAt: now.toISOString(),
          lastSyncStatus: 'ok',
          lastSyncError: undefined,
          lastSyncBookings: bookings.length,
        },
      },
      user?.username || ''
    )

    return { ok: true, bookings: bookings.length, scheduled, skippedForQuota }
  } catch (error: any) {
    const message = String(error?.message || error)
    await patchUserSettings(
      userId,
      {
        usesession: {
          ...settings.usesession,
          lastSyncAt: new Date().toISOString(),
          lastSyncStatus: 'error',
          lastSyncError: message,
        },
      },
      user?.username || ''
    )
    return { ok: false, bookings: 0, scheduled: 0, skippedForQuota: 0, error: message }
  }
}

export async function syncAllConnected(): Promise<{ users: number; totalScheduled: number }> {
  const ids = await listConnectedUserIds()
  let totalScheduled = 0
  for (const id of ids) {
    const result = await syncUserBookings(id)
    totalScheduled += result.scheduled
  }
  return { users: ids.length, totalScheduled }
}
