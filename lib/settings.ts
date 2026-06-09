// Per-user settings + UseSession connection/token storage (multi-tenant).
// Everything is namespaced by userId so each photographer has their own area.

import { kv } from '@vercel/kv'
import { decrypt, encrypt } from './crypto'
import { UserSettings } from './types'

const CONNECTED_SET = 'usesession:connected' // set of userIds with a stored token

// Keep this GSM-7 (no em dash / smart quotes) and lean so it sends as ONE SMS
// segment. A single "—" forces Unicode (UCS-2) encoding = ~3x the segments/cost.
const DEFAULT_REMINDER_TEMPLATE =
  'Hi {name}! Reminder: your {sessionTitle} session is on {sessionTime}. See you then! {studioName}'

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
    emailReminders: false,
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

// --- Per-tenant SMS sender (Twilio) -------------------------------------
// When a tenant has an ACTIVE Twilio sender, their SMS sends from their own
// toll-free number / Messaging Service. Anything other than 'active' => fall
// back to the shared TextMagic account during migration.
//
// Lifecycle: none -> provisioning -> pending_verification -> active | failed
//   - provisioning:         number bought, messaging service being set up
//   - pending_verification: toll-free verification submitted, awaiting Twilio
//   - active:               Twilio approved; tenant sends from their own number
//   - failed:               provisioning errored or verification rejected

export type TenantSmsStatus =
  | 'none'
  | 'provisioning'
  | 'pending_verification'
  | 'active'
  | 'failed'

export interface TenantSmsSender {
  status: TenantSmsStatus
  messagingServiceSid?: string
  phoneNumber?: string // E.164 toll-free, e.g. +18005551234
  phoneNumberSid?: string // Twilio PN... sid for the purchased number
  verificationSid?: string // Twilio HH... toll-free verification sid
  verificationStatus?: string // PENDING_REVIEW | IN_REVIEW | TWILIO_APPROVED | TWILIO_REJECTED
  rejectionReason?: string
  error?: string
  updatedAt?: string
  // legacy 10DLC fields (unused on the toll-free path, kept for back-compat)
  brandSid?: string
  campaignSid?: string
}

export async function getTenantSmsSender(userId: string): Promise<TenantSmsSender | null> {
  try {
    return (await kv.get<TenantSmsSender>(`user:${userId}:sms_sender`)) || null
  } catch (error) {
    console.error('getTenantSmsSender error:', error)
    return null
  }
}

export async function setTenantSmsSender(userId: string, sender: TenantSmsSender): Promise<void> {
  await kv.set(`user:${userId}:sms_sender`, { ...sender })
}

export async function patchTenantSmsSender(
  userId: string,
  patch: Partial<TenantSmsSender>
): Promise<TenantSmsSender> {
  const current = (await getTenantSmsSender(userId)) || { status: 'none' as TenantSmsStatus }
  const next: TenantSmsSender = { ...current, ...patch }
  await setTenantSmsSender(userId, next)
  return next
}

// --- Per-tenant business details (for toll-free verification) ------------
// Collected during onboarding; submitted to Twilio's toll-free verification
// API and retained so we can resubmit if a verification is rejected.

export interface TenantBusiness {
  legalName: string
  website: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  addressCountry: string // ISO-2, e.g. 'US'
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string // E.164
  // Opt-in/consent fields are standardized platform-side (same flow for every
  // tenant), so they are NOT collected from the photographer. Kept optional for
  // back-compat with any records that stored them.
  optInType?: 'VERBAL' | 'WEB_FORM' | 'PAPER_FORM' | 'VIA_TEXT' | 'MOBILE_QR_CODE'
  optInDetails?: string
  messageSample?: string
  monthlyVolume?: string // Twilio expects a string bucket, e.g. '10', '100', '1,000'
  updatedAt?: string
}

export async function getTenantBusiness(userId: string): Promise<TenantBusiness | null> {
  try {
    return (await kv.get<TenantBusiness>(`user:${userId}:business`)) || null
  } catch (error) {
    console.error('getTenantBusiness error:', error)
    return null
  }
}

export async function setTenantBusiness(userId: string, biz: TenantBusiness): Promise<void> {
  await kv.set(`user:${userId}:business`, { ...biz })
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
