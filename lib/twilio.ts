// Twilio client + send wrapper for the per-tenant (ISV) SMS model.
// Accepts EITHER credential style so whatever you have works:
//   (a) API Key:  TWILIO_ACCOUNT_SID + TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET
//   (b) Auth Token: TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
// API Key is preferred when both are present. No-ops cleanly if unconfigured.

import twilio from 'twilio'

export function twilioConfigured(): boolean {
  const hasAccount = !!process.env.TWILIO_ACCOUNT_SID
  const hasApiKey = !!(process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET)
  const hasAuthToken = !!process.env.TWILIO_AUTH_TOKEN
  return hasAccount && (hasApiKey || hasAuthToken)
}

function getClient() {
  if (!twilioConfigured()) return null
  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  // Prefer an API Key (SK.../secret) scoped to the account; otherwise use the
  // account's Auth Token. Either works for everything we do.
  if (process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET) {
    return twilio(process.env.TWILIO_API_KEY_SID, process.env.TWILIO_API_KEY_SECRET, { accountSid })
  }
  return twilio(accountSid, process.env.TWILIO_AUTH_TOKEN!)
}

export interface TwilioSender {
  // Prefer a Messaging Service (handles 10DLC routing); fall back to a raw number.
  messagingServiceSid?: string
  from?: string
}

export async function sendViaTwilio(
  to: string,
  body: string,
  sender: TwilioSender
): Promise<{ ok: boolean; sid?: string; error?: string; code?: number }> {
  const client = getClient()
  if (!client) return { ok: false, error: 'Twilio not configured' }
  if (!sender.messagingServiceSid && !sender.from) {
    return { ok: false, error: 'No Twilio sender (messagingServiceSid or from) configured' }
  }
  try {
    const opts: Record<string, string> = { to, body }
    if (sender.messagingServiceSid) opts.messagingServiceSid = sender.messagingServiceSid
    else if (sender.from) opts.from = sender.from
    const msg = await client.messages.create(opts as any)
    return { ok: true, sid: msg.sid }
  } catch (e: any) {
    console.error('Twilio send failed:', e?.message || e)
    return { ok: false, error: e?.message || String(e), code: e?.code }
  }
}

// --- Provisioning (ISV / per-tenant toll-free) ---------------------------
// These are the building blocks the provisioning orchestrator chains together.
// Each costs real money or quota, so callers must gate them behind admin/auth.

const APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'

// Search for an available US toll-free number to purchase.
export async function findAvailableTollFree(): Promise<{ phoneNumber?: string; error?: string }> {
  const client = getClient()
  if (!client) return { error: 'Twilio not configured' }
  try {
    const numbers = await client.availablePhoneNumbers('US').tollFree.list({ smsEnabled: true, limit: 5 })
    const pick = numbers[0]
    if (!pick) return { error: 'No toll-free numbers available' }
    return { phoneNumber: pick.phoneNumber }
  } catch (e: any) {
    return { error: e?.message || String(e) }
  }
}

// Purchase a specific phone number. Returns the IncomingPhoneNumber sid (PN...).
export async function purchaseNumber(
  phoneNumber: string
): Promise<{ sid?: string; phoneNumber?: string; error?: string }> {
  const client = getClient()
  if (!client) return { error: 'Twilio not configured' }
  try {
    const bought = await client.incomingPhoneNumbers.create({
      phoneNumber,
      smsUrl: `${APP_BASE_URL}/api/twilio/inbound`, // handle STOP/HELP + replies
    })
    return { sid: bought.sid, phoneNumber: bought.phoneNumber }
  } catch (e: any) {
    return { error: e?.message || String(e) }
  }
}

// Release a number (cleanup if provisioning fails partway).
export async function releaseNumber(sid: string): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: false, error: 'Twilio not configured' }
  try {
    await client.incomingPhoneNumbers(sid).remove()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

// Create a Messaging Service for a tenant and attach their number to it.
export async function createMessagingServiceWithNumber(
  friendlyName: string,
  phoneNumberSid: string
): Promise<{ messagingServiceSid?: string; error?: string }> {
  const client = getClient()
  if (!client) return { error: 'Twilio not configured' }
  let serviceSid: string | undefined
  try {
    const service = await client.messaging.v1.services.create({
      friendlyName,
      // Reply STOP/HELP handled by Twilio's Advanced Opt-Out + our inbound webhook.
      useInboundWebhookOnNumber: false,
      inboundRequestUrl: `${APP_BASE_URL}/api/twilio/inbound`,
    })
    serviceSid = service.sid
    await client.messaging.v1.services(service.sid).phoneNumbers.create({ phoneNumberSid })
    return { messagingServiceSid: service.sid }
  } catch (e: any) {
    // If the service was created but attaching the number failed, delete the
    // orphaned service before returning so we don't accumulate dangling ones.
    if (serviceSid) {
      await client.messaging.v1.services(serviceSid).remove().catch(() => {})
    }
    return { error: e?.message || String(e) }
  }
}

export interface TollfreeVerificationInput {
  // The verification is bound to the purchased toll-free NUMBER (PN... sid),
  // not the Messaging Service.
  tollfreePhoneNumberSid: string
  businessName: string
  businessWebsite: string
  notificationEmail: string
  useCaseSummary: string
  productionMessageSample: string
  optInImageUrls: string[]
  optInType: 'VERBAL' | 'WEB_FORM' | 'PAPER_FORM' | 'VIA_TEXT' | 'MOBILE_QR_CODE'
  messageVolume: string
  businessStreetAddress: string
  businessCity: string
  businessStateProvinceRegion: string
  businessPostalCode: string
  businessCountry: string
  businessContactFirstName: string
  businessContactLastName: string
  businessContactEmail: string
  businessContactPhone: string
  // Defaults to SOLE_PROPRIETOR (no registration number needed). For a
  // registered entity (LLC/CORP/etc.) the registration fields become required.
  businessType?: string
  businessRegistrationNumber?: string
  businessRegistrationAuthority?: string
  businessRegistrationCountry?: string
  additionalInformation?: string
}

// Submit a toll-free verification. Returns HH... verification sid + status.
// privacyPolicyUrl + the opt-in/HELP details are what the carriers actually
// reject on (the prior 10DLC campaign failed for an unverifiable privacy
// policy), so we always include them.
export async function submitTollfreeVerification(
  input: TollfreeVerificationInput
): Promise<{ sid?: string; status?: string; error?: string }> {
  const client = getClient()
  if (!client) return { error: 'Twilio not configured' }
  try {
    const v = await client.messaging.v1.tollfreeVerifications.create({
      tollfreePhoneNumberSid: input.tollfreePhoneNumberSid,
      businessName: input.businessName,
      businessType: input.businessType || 'SOLE_PROPRIETOR',
      ...(input.businessType && input.businessType !== 'SOLE_PROPRIETOR'
        ? {
            businessRegistrationNumber: input.businessRegistrationNumber,
            businessRegistrationAuthority: input.businessRegistrationAuthority,
            businessRegistrationCountry: input.businessRegistrationCountry,
          }
        : {}),
      businessWebsite: input.businessWebsite,
      notificationEmail: input.notificationEmail,
      // Appointment reminders are transactional account/service notifications.
      // Must be one of Twilio's enum values (NOT the free-form 'NOTIFICATIONS').
      useCaseCategories: ['ACCOUNT_NOTIFICATIONS'],
      useCaseSummary: input.useCaseSummary,
      productionMessageSample: input.productionMessageSample,
      optInImageUrls: input.optInImageUrls,
      optInType: input.optInType,
      messageVolume: input.messageVolume,
      businessStreetAddress: input.businessStreetAddress,
      businessCity: input.businessCity,
      businessStateProvinceRegion: input.businessStateProvinceRegion,
      businessPostalCode: input.businessPostalCode,
      businessCountry: input.businessCountry,
      businessContactFirstName: input.businessContactFirstName,
      businessContactLastName: input.businessContactLastName,
      businessContactEmail: input.businessContactEmail,
      businessContactPhone: input.businessContactPhone,
      privacyPolicyUrl: `${APP_BASE_URL}/privacy`,
      optInKeywords: ['START', 'YES'],
      optInConfirmationMessage:
        "You're subscribed to appointment reminders. Reply STOP to opt out, HELP for help. Msg & data rates may apply.",
      helpMessageSample:
        'SessionRemind reminders: contact support@sessionremind.com. Reply STOP to opt out. Msg & data rates may apply.',
      ...(input.additionalInformation ? { additionalInformation: input.additionalInformation } : {}),
    } as any)
    return { sid: v.sid, status: v.status }
  } catch (e: any) {
    return { error: e?.message || String(e) }
  }
}

// Poll a toll-free verification's current status.
export async function fetchTollfreeVerification(
  sid: string
): Promise<{ status?: string; rejectionReason?: string; error?: string }> {
  const client = getClient()
  if (!client) return { error: 'Twilio not configured' }
  try {
    const v = await client.messaging.v1.tollfreeVerifications(sid).fetch()
    return { status: v.status, rejectionReason: (v as any).rejectionReason || undefined }
  } catch (e: any) {
    return { error: e?.message || String(e) }
  }
}
