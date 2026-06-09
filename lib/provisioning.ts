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

import {
  TenantBusiness,
  TenantSmsSender,
  getTenantSmsSender,
  patchTenantSmsSender,
  getTenantBusiness,
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

// A public image proving the opt-in flow is required by Twilio. We default to a
// hosted screenshot of the UseSession booking consent; override per-tenant via env.
const DEFAULT_OPT_IN_IMAGE =
  process.env.TOLLFREE_OPT_IN_IMAGE_URL || 'https://sessionremind.com/opt-in-proof.png'

export interface ProvisionResult {
  ok: boolean
  sender?: TenantSmsSender
  error?: string
}

export async function provisionTollFree(
  userId: string,
  studioName: string,
  business?: TenantBusiness
): Promise<ProvisionResult> {
  if (!twilioConfigured()) return { ok: false, error: 'Twilio not configured' }

  const biz = business || (await getTenantBusiness(userId))
  if (!biz) return { ok: false, error: 'No business details on file for this tenant' }

  // Guard: don't re-provision a tenant that already has a number.
  const existing = await getTenantSmsSender(userId)
  if (existing && existing.status !== 'none' && existing.status !== 'failed') {
    return { ok: false, error: `Tenant already provisioned (status: ${existing.status})` }
  }

  await patchTenantSmsSender(userId, { status: 'provisioning', error: undefined, updatedAt: nowIso() })

  // 1) Find + buy a toll-free number.
  const found = await findAvailableTollFree()
  if (found.error || !found.phoneNumber) {
    return fail(userId, found.error || 'No toll-free number available')
  }
  const bought = await purchaseNumber(found.phoneNumber)
  if (bought.error || !bought.sid) {
    return fail(userId, `Purchase failed: ${bought.error || 'unknown'}`)
  }
  const phoneNumberSid = bought.sid
  const phoneNumber = bought.phoneNumber || found.phoneNumber

  // 2) Messaging Service + attach the number.
  const svc = await createMessagingServiceWithNumber(`SessionRemind — ${studioName}`, phoneNumberSid)
  if (svc.error || !svc.messagingServiceSid) {
    await releaseNumber(phoneNumberSid) // don't leave a paid orphan number
    return fail(userId, `Messaging Service failed: ${svc.error || 'unknown'}`)
  }
  const messagingServiceSid = svc.messagingServiceSid

  // 3) Submit toll-free verification (bound to the number, not the service).
  const verification = await submitTollfreeVerification({
    tollfreePhoneNumberSid: phoneNumberSid,
    businessName: biz.legalName,
    businessWebsite: biz.website,
    notificationEmail: biz.contactEmail,
    useCaseSummary:
      'Appointment reminder texts sent to photography clients about sessions they booked. ' +
      'Reminders include the session date, time, and location. No marketing.',
    productionMessageSample: biz.messageSample,
    optInImageUrls: [DEFAULT_OPT_IN_IMAGE],
    optInType: biz.optInType,
    messageVolume: biz.monthlyVolume,
    businessStreetAddress: biz.addressStreet,
    businessCity: biz.addressCity,
    businessStateProvinceRegion: biz.addressState,
    businessPostalCode: biz.addressZip,
    businessCountry: biz.addressCountry || 'US',
    businessContactFirstName: biz.contactFirstName,
    businessContactLastName: biz.contactLastName,
    businessContactEmail: biz.contactEmail,
    businessContactPhone: biz.contactPhone,
    additionalInformation:
      'Clients opt in by providing their mobile number when booking a session through UseSession ' +
      'and agreeing to receive reminder texts about that session.',
  })

  // Number + service exist even if verification submission failed; keep them and
  // let an admin retry the verification rather than tearing everything down.
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
    updatedAt: nowIso(),
  })
  return { ok: true, sender }
}

// Re-check a pending verification with Twilio and flip the tenant to active when
// approved. Safe to call repeatedly (e.g. from a cron or an admin "refresh").
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
  return { ok: true, sender: updated }
}

function nowIso(): string {
  // Date.now()/new Date() are fine in the Next.js runtime (not a workflow script).
  return new Date().toISOString()
}

async function fail(userId: string, error: string): Promise<ProvisionResult> {
  const sender = await patchTenantSmsSender(userId, { status: 'failed', error, updatedAt: nowIso() })
  return { ok: false, sender, error }
}
