// Per-user settings + UseSession connection/token storage (multi-tenant).
// Everything is namespaced by userId so each photographer has their own area.

import { kv } from '@vercel/kv'
import { decrypt, encrypt } from './crypto'
import { UserSettings } from './types'

const CONNECTED_SET = 'usesession:connected' // set of userIds with a stored token

const DEFAULT_REMINDER_TEMPLATE =
  "Hi {name}! This is a friendly reminder about your {sessionTitle} session on {sessionTime}. " +
  "Can't wait to see you! — {studioName}"

const DEFAULT_REGISTRATION_TEMPLATE =
  "Hi {name}! You're all set for text reminders from {studioName}. Your {sessionTitle} session is on " +
  '{sessionTime}. Reply STOP to opt out anytime.'

export function defaultSettings(studioName: string): UserSettings {
  return {
    studioName: studioName || 'your studio',
    reminderTemplate: DEFAULT_REMINDER_TEMPLATE,
    registrationTemplate: DEFAULT_REGISTRATION_TEMPLATE,
    offsetsDays: [3, 1],
    sendHourEastern: 10,
    autoSchedule: true,
    usesession: { connected: false },
  }
}

function settingsKey(userId: string): string {
  return `user:${userId}:settings`
}

function tokenKey(userId: string): string {
  return `user:${userId}:usesession_token`
}

export async function getUserSettings(userId: string, fallbackStudioName = ''): Promise<UserSettings> {
  try {
    const raw = await kv.get<UserSettings>(settingsKey(userId))
    const base = defaultSettings(fallbackStudioName)
    if (!raw) return base
    // Merge so newly-added fields get sensible defaults.
    return {
      ...base,
      ...raw,
      usesession: { ...base.usesession, ...(raw.usesession || {}) },
    }
  } catch (error) {
    console.error('getUserSettings error:', error)
    return defaultSettings(fallbackStudioName)
  }
}

export async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  await kv.set(settingsKey(userId), settings)
}

export async function patchUserSettings(
  userId: string,
  patch: Partial<UserSettings>,
  fallbackStudioName = ''
): Promise<UserSettings> {
  const current = await getUserSettings(userId, fallbackStudioName)
  const next: UserSettings = {
    ...current,
    ...patch,
    usesession: { ...current.usesession, ...(patch.usesession || {}) },
  }
  await saveUserSettings(userId, next)
  return next
}

// --- UseSession token (encrypted at rest) ---------------------------------

export async function setUseSessionToken(userId: string, token: string): Promise<void> {
  await kv.set(tokenKey(userId), encrypt(token))
  await kv.sadd(CONNECTED_SET, userId)
}

export async function getUseSessionToken(userId: string): Promise<string | null> {
  const enc = await kv.get<string>(tokenKey(userId))
  if (!enc) return null
  try {
    return decrypt(enc)
  } catch (error) {
    console.error('Failed to decrypt UseSession token for', userId, error)
    return null
  }
}

export async function clearUseSessionToken(userId: string): Promise<void> {
  await kv.del(tokenKey(userId))
  await kv.srem(CONNECTED_SET, userId)
}

// All userIds with a stored UseSession token — used by the cron to sync everyone.
export async function listConnectedUserIds(): Promise<string[]> {
  try {
    return (await kv.smembers(CONNECTED_SET)) || []
  } catch (error) {
    console.error('listConnectedUserIds error:', error)
    return []
  }
}
