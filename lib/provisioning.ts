// Per-tenant toll-free SMS provisioning orchestrator (ISV model).
//
// Chains the Twilio building blocks into one idempotent-ish pipeline:
//   1. buy a toll-free number
//   2. create a Messaging Service and attach the number
//   3. submit a toll-free verification with the tenant's business details
//   4. store the resulting sender state (pending_verification)
//
// Each step costs real money/quota, so callers MUST gate this behind admin
// auth. On any failure after a number is purchased, we release the number so a
// failed run doesn't silently leave a ~$2/mo charge behind.

import { kv } from '@vercel/kv'
import {
  TenantBusiness,
  TenantSmsSender,
  getTenantSmsSender,
  patchTenantSmsSender,
  getTenantBusiness,
  getUserSettings,
  addPendingVerification,
  removePendingVerification,
  listPendingVerifications,
} from './settings'
import {
  findAvailableTollFree,
  purchaseNumber,
  createMessagingServiceWithNumber,
  submitTollfreeVerification,
  fetchTollfreeVerification,
  releaseNumber,
  twilioConfigured,
} from './twilio'
import { getUserById } from './auth'
import { sendTollfreeApprovedEmail, sendTollfreeRejectedEmail } from './email'

// --- Platform-standardized consent (same for EVERY tenant) ----------------
// In the ISV model the opt-in flow is identical for all studios (clients give
// their number when booking via the studio's online booking page and thereby
// consent to transactional appointment reminders). So we do NOT ask each
// photographer to describe consent — these values are fixed platform-side, and
// a single hosted opt-in proof image is reused across all verifications.

const APP_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'

// A public image proving the opt-in flow is required by Twilio. This is a
// platform asset hosted by us and reused for every tenant.
const DEFAULT_OPT_IN_IMAGE = process.env.TOLLFREE_OPT_IN_IMAGE_URL || `${APP_BASE}/opt-in-proof.png`

const PLATFORM_OPT_IN_TYPE = 'WEB_FORM' as const

const PLATFORM_OPT_IN_DETAILS =
  'Clients provide their mobile number when booking a session through the studio’s online ' +
  'booking page and agree to receive transactional appointment reminder texts about that session. ' +
  'Messages are reminders only (no marketing). Every recipient can reply STOP to opt out at any time.'

const PLATFORM_USE_CASE_SUMMARY =
  'Appointment reminder texts sent to a photography studio’s clients about sessions they booked. ' +
  'Reminders include the session date, time, and location. Transactional only — no marketing.'

// Map a tenant's included-texts limit to Twilio's monthly-volume bucket.
function volumeBucket(smsLimit?: number): string {
  const n = smsLimit || 0
  if (n <= 200) return '100'
  if (n <= 2000) return '1,000'
  return '10,000'
}

// Build a realistic sample reminder from the tenant's own template + studio name.
function sampleMessage(template: string, studioName: string): string {
  const fill: Record<string, string> = {
    name: 'Jordan',
    sessionTitle: 'Family Portrait',
    sessionTime: 'Sat Jun 14 at 10:00 AM',
    studioName: studioName || 'your studio',
  }
  let out = (template || '').replace(/\{(\w+)\}/g, (_, k) => fill[k] ?? `{${k}}`)
  if (!out.trim()) {
    out = `Hi Jordan! Reminder: your Family Portrait session is on Sat Jun 14 at 10:00 AM. See you then! ${fill.studioName}`
  }
  return out
}

export interface ProvisionResult {
  ok: boolean
  sender?: TenantSmsSender
  error?: string
}

// How long a 'provisioning' record may sit before we treat it as crashed and
// allow a retry (e.g. a serverless timeout left it stuck).
const STALE_PROVISIONING_MS = 10 * 60 * 1000
// Keep the lock alive as long as the stale window so a crashed run's lock and its
// 'provisioning' record expire together — no window where a retry grabs the lock
// but is still told "already provisioned".
const LOCK_TTL_SECONDS = STALE_PROVISIONING_MS / 1000

// A prior run may have already bought a number / created a service before failing
// or timing out. Those are retryable, and on retry we REUSE the existing paid
// resources instead of buying new ones (which would orphan the old ones).
function isRetryable(s: TenantSmsSender | null): boolean {
  if (!s || s.status === 'none' || s.status === 'failed') return true
  if (s.status === 'provisioning') {
    const t = s.updatedAt ? Date.parse(s.updatedAt) : 0
    return !t || Date.now() - t > STALE_PROVISIONING_MS
  }
  return false
}

export async function provisionTollFree(
  userId: string,
  studioName: string,
  business?: TenantBusiness
): Promise<ProvisionResult> {
  if (!twilioConfigured()) return { ok: false, error: 'Twilio not configured' }

  const biz = business || (await getTenantBusiness(userId))
  if (!biz) return { ok: false, error: 'No business details on file for this tenant' }

  // Atomic per-user lock acquired BEFORE any spend — prevents a double-click or
  // an admin call racing a self-serve call from buying two numbers. Auto-expires
  // so a crashed run can't lock the tenant out forever.
  const lockKey = `provision:lock:${userId}`
  const gotLock = await kv.set(lockKey, '1', { nx: true, ex: LOCK_TTL_SECONDS })
  if (gotLock === null) {
    return { ok: false, error: 'Provisioning already in progress — give it a moment.' }
  }

  try {
    const existing = await getTenantSmsSender(userId)
    if (!isRetryable(existing)) {
      return { ok: false, error: `Tenant already provisioned (status: ${existing!.status})` }
    }

    // Reuse any paid resources a prior attempt already created.
    let phoneNumberSid = existing?.phoneNumberSid
    let phoneNumber = existing?.phoneNumber
    let messagingServiceSid = existing?.messagingServiceSid

    await patchTenantSmsSender(userId, {
      status: 'provisioning',
      phoneNumberSid,
      phoneNumber,
      messagingServiceSid,
      error: undefined,
      updatedAt: nowIso(),
    })

    const settings = await getUserSettings(userId, studioName)
    const smsLimit = await getSmsLimit(userId)

    // 1) Buy a toll-free number (only if we don't already have one).
    if (!phoneNumberSid) {
      const found = await findAvailableTollFree()
      if (found.error || !found.phoneNumber) {
        return await fail(userId, found.error || 'No toll-free number available')
      }
      const bought = await purchaseNumber(found.phoneNumber)
      if (bought.error || !bought.sid) {
        return await fail(userId, `Purchase failed: ${bought.error || 'unknown'}`)
      }
      phoneNumberSid = bought.sid
      phoneNumber = bought.phoneNumber || found.phoneNumber
      // Persist immediately so a later crash can't orphan an unrecoverable number.
      await patchTenantSmsSender(userId, { status: 'provisioning', phoneNumberSid, phoneNumber, updatedAt: nowIso() })
    }

    // 2) Messaging Service + attach the number (only if we don't already have one).
    if (!messagingServiceSid) {
      const svc = await createMessagingServiceWithNumber(`SessionRemind — ${studioName}`, phoneNumberSid)
      if (svc.error || !svc.messagingServiceSid) {
        const released = await releaseNumber(phoneNumberSid) // don't leave a paid orphan number
        // Only forget the number if it was actually released. If the release call
        // itself failed, KEEP the SID (status 'failed') so the still-billing number
        // can be released on a later retry / by the admin — never erase a live SID.
        return await fail(userId, `Messaging Service failed: ${svc.error || 'unknown'}`, released.ok)
      }
      messagingServiceSid = svc.messagingServiceSid
      await patchTenantSmsSender(userId, { status: 'provisioning', messagingServiceSid, updatedAt: nowIso() })
    }

    // 3) Submit toll-free verification (bound to the number, not the service).
    // Consent fields are platform-standardized; identity fields are the tenant's.
    const verification = await submitTollfreeVerification({
      tollfreePhoneNumberSid: phoneNumberSid,
      businessName: biz.legalName,
      businessWebsite: biz.website,
      notificationEmail: biz.contactEmail,
      useCaseSummary: PLATFORM_USE_CASE_SUMMARY,
      productionMessageSample: sampleMessage(settings.reminderTemplate, settings.studioName || studioName),
      optInImageUrls: [DEFAULT_OPT_IN_IMAGE],
      optInType: PLATFORM_OPT_IN_TYPE,
      messageVolume: volumeBucket(smsLimit),
      businessStreetAddress: biz.addressStreet,
      businessCity: biz.addressCity,
      businessStateProvinceRegion: biz.addressState,
      businessPostalCode: biz.addressZip,
      businessCountry: biz.addressCountry || 'US',
      businessContactFirstName: biz.contactFirstName,
      businessContactLastName: biz.contactLastName,
      businessContactEmail: biz.contactEmail,
      businessContactPhone: biz.contactPhone,
      additionalInformation: PLATFORM_OPT_IN_DETAILS,
    })

    // Number + service exist even if verification submission failed; KEEP them so
    // a retry reuses them (see isRetryable / the reuse logic above) instead of
    // buying a new number.
    if (verification.error || !verification.sid) {
      const sender = await patchTenantSmsSender(userId, {
        status: 'failed',
        messagingServiceSid,
        phoneNumber,
        phoneNumberSid,
        error: `Verification submit failed: ${verification.error || 'unknown'}`,
        updatedAt: nowIso(),
      })
      return { ok: false, sender, error: sender.error }
    }

    const sender = await patchTenantSmsSender(userId, {
      status: 'pending_verification',
      messagingServiceSid,
      phoneNumber,
      phoneNumberSid,
      verificationSid: verification.sid,
      verificationStatus: verification.status || 'PENDING_REVIEW',
      error: undefined,
      outcomeNotifiedAt: undefined, // reset so a re-submission can notify again
      updatedAt: nowIso(),
    })
    // Track for the cron to poll until Twilio decides, then auto-email the studio.
    await addPendingVerification(userId)
    return { ok: true, sender }
  } catch (e: any) {
    // Any unexpected throw (incl. a KV write failure) lands here so the tenant is
    // left 'failed' (retryable) rather than stuck 'provisioning'. Persisted
    // phoneNumberSid/messagingServiceSid are retained for reuse/cleanup on retry.
    console.error('provisionTollFree unexpected error:', e?.message || e)
    const sender = await patchTenantSmsSender(userId, {
      status: 'failed',
      error: `Unexpected error: ${e?.message || String(e)}`,
      updatedAt: nowIso(),
    }).catch(() => undefined)
    return { ok: false, sender: sender || undefined, error: e?.message || String(e) }
  } finally {
    await kv.del(lockKey).catch(() => {})
  }
}

// Re-check a pending verification with Twilio and flip the tenant to active when
// approved (or failed when rejected). Safe to call repeatedly — from the cron OR
// an admin/self-serve "refresh". On the FIRST transition to a terminal state it
// emails the studio exactly once and drops them from the pending-poll set.
export async function refreshVerificationStatus(userId: string): Promise<ProvisionResult> {
  const sender = await getTenantSmsSender(userId)
  if (!sender?.verificationSid) return { ok: false, error: 'No verification on file' }

  const v = await fetchTollfreeVerification(sender.verificationSid)
  if (v.error) return { ok: false, sender, error: v.error }

  const vStatus = v.status || sender.verificationStatus
  const patch: Partial<TenantSmsSender> = {
    verificationStatus: vStatus,
    updatedAt: nowIso(),
  }
  if (vStatus === 'TWILIO_APPROVED') {
    patch.status = 'active'
    patch.rejectionReason = undefined
  } else if (vStatus === 'TWILIO_REJECTED') {
    patch.status = 'failed'
    patch.rejectionReason = v.rejectionReason
  } else {
    patch.status = 'pending_verification'
  }
  const updated = await patchTenantSmsSender(userId, patch)

  // Fire the studio's outcome email exactly once, the first time we land on a
  // terminal status — regardless of whether cron or a manual refresh got here.
  const terminal = updated.status === 'active' || updated.status === 'failed'
  if (terminal && !sender.outcomeNotifiedAt) {
    await removePendingVerification(userId)
    await notifyOutcome(userId, updated).catch((e) =>
      console.error('notifyOutcome failed for', userId, e)
    )
    await patchTenantSmsSender(userId, { outcomeNotifiedAt: nowIso() })
  } else if (terminal) {
    await removePendingVerification(userId)
  }

  return { ok: true, sender: updated }
}

// Cron entry point: poll every tenant still awaiting verification. The email +
// set-removal happen inside refreshVerificationStatus, so this just drives it.
export async function pollPendingVerifications(): Promise<{ checked: number }> {
  const ids = await listPendingVerifications()
  for (const userId of ids) {
    try {
      await refreshVerificationStatus(userId)
    } catch (e) {
      console.error('pollPendingVerifications error for', userId, e)
    }
  }
  return { checked: ids.length }
}

// Email the studio about their dedicated-number verification outcome. Prefers
// the business contact email, falling back to the account email.
async function notifyOutcome(userId: string, sender: TenantSmsSender): Promise<void> {
  const to = await recipientEmail(userId)
  if (!to) return
  const settings = await getUserSettings(userId)
  const studioName = settings.studioName || ''
  if (sender.status === 'active') {
    await sendTollfreeApprovedEmail(to, studioName, sender.phoneNumber)
  } else if (sender.status === 'failed') {
    await sendTollfreeRejectedEmail(to, studioName, sender.rejectionReason)
  }
}

async function recipientEmail(userId: string): Promise<string | null> {
  const biz = await getTenantBusiness(userId)
  if (biz?.contactEmail) return biz.contactEmail
  try {
    const user = await getUserById(userId)
    return user?.email || null
  } catch {
    return null
  }
}

function nowIso(): string {
  // Date.now()/new Date() are fine in the Next.js runtime (not a workflow script).
  return new Date().toISOString()
}

async function getSmsLimit(userId: string): Promise<number> {
  try {
    const v = await kv.hget<number | string>(`user:${userId}`, 'sms_limit')
    return Number(v) || 0
  } catch {
    return 0
  }
}

// Mark the tenant 'failed' (retryable). When clearNumber is set (we released the
// purchased number), wipe the stored number SIDs so a retry buys a fresh one
// instead of reusing a dead/released SID.
async function fail(userId: string, error: string, clearNumber = false): Promise<ProvisionResult> {
  const patch: Partial<TenantSmsSender> = { status: 'failed', error, updatedAt: nowIso() }
  if (clearNumber) {
    patch.phoneNumberSid = undefined
    patch.phoneNumber = undefined
    patch.messagingServiceSid = undefined
  }
  const sender = await patchTenantSmsSender(userId, patch)
  return { ok: false, sender, error }
}
