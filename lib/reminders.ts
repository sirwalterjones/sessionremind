// Shared reminder engine — the single source of truth for phone cleaning,
// date parsing, template rendering, and turning a Booking into ScheduledMessages.
// Previously this logic was duplicated (and subtly different) across
// send-sms, schedule-reminders, and process-scheduled.

import { Booking, BookingSource, ReminderType, ScheduledMessage, UserSettings } from './types'

// ---------------------------------------------------------------------------
// Phone
// ---------------------------------------------------------------------------

// Normalize to the 10-digit US format TextMagic expects (no +, no country code).
export function cleanPhone(input: string): string {
  let digits = (input || '').replace(/[^\d]/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1)
  } else if (digits.length > 10) {
    digits = digits.substring(digits.length - 10)
  }
  return digits
}

export function isValidPhone(input: string): boolean {
  return cleanPhone(input).length === 10
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

// Parse a session time string into a Date. Returns null if unparseable.
// Handles ISO, epoch ms/seconds, and the human formats UseSession/forms produce
// e.g. "Saturday, June 27th, 2026 at 10:00 AM" or "June 27, 2026 10:00 AM".
export function parseSessionDate(input: string | number | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') return null

  // Numbers / epoch
  if (typeof input === 'number') {
    const ms = input < 1e12 ? input * 1000 : input // seconds vs ms
    const d = new Date(ms)
    return isNaN(d.getTime()) ? null : d
  }

  const raw = String(input).trim()

  // ISO 8601
  const iso = new Date(raw)
  if (!isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}/.test(raw)) return iso

  const strategies: Array<() => Date | null> = [
    // Cleaned natural language
    () => {
      let s = raw.toLowerCase()
      s = s.replace(/(\d+)(st|nd|rd|th)/g, '$1') // ordinals
      s = s.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i, '')
      s = s.replace(/(\d{1,2}:\d{2}\s*(am|pm))\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/i, '$1') // ranges -> start
      s = s.replace(/ at /g, ' ')
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d
    },
    // Explicit "Month D[th], YYYY at H:MM AM/PM"
    () => {
      const m = raw.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})\s+(?:at\s+)?(\d{1,2}):(\d{2})\s*(AM|PM)/i)
      if (!m) return null
      const [, month, day, year, hour, minute, ampm] = m
      const d = new Date(`${month} ${day}, ${year} ${hour}:${minute} ${ampm}`)
      return isNaN(d.getTime()) ? null : d
    },
    // Date only, default to noon
    () => {
      const datePart = raw.split(' at ')[0] || raw.split(/\d{1,2}:\d{2}/)[0]
      if (!datePart) return null
      let s = datePart.replace(/(\d+)(st|nd|rd|th)/g, '$1')
      s = s.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i, '')
      const d = new Date(`${s} 12:00 PM`)
      return isNaN(d.getTime()) ? null : d
    },
  ]

  for (const strat of strategies) {
    try {
      const d = strat()
      if (d && !isNaN(d.getTime()) && d.getFullYear() > 2020) return d
    } catch {
      /* try next */
    }
  }
  return null
}

// Build a clean human label for a session datetime (used in templates / display).
export function formatSessionLabel(d: Date): string {
  return d.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  })
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface TemplateVars {
  name?: string
  sessionTitle?: string
  sessionTime?: string
  studioName?: string
  email?: string
  phone?: string
}

export function renderTemplate(template: string, vars: TemplateVars): string {
  return (template || '')
    .replace(/\{name\}/g, vars.name || '')
    .replace(/\{sessionTitle\}/g, vars.sessionTitle || '')
    .replace(/\{sessionTime\}/g, vars.sessionTime || '')
    .replace(/\{studioName\}/g, vars.studioName || '')
    .replace(/\{email\}/g, vars.email || '')
    .replace(/\{phone\}/g, vars.phone || '')
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function dedupeKey(userId: string, booking: Booking, reminderType: ReminderType): string {
  const stable = booking.externalId || `${cleanPhone(booking.phone)}@${booking.sessionDateISO}`
  return `${userId}:${stable}:${reminderType}`
}

// Compute the send time: `offsetDays` before the session, at the configured
// Eastern hour. Approximated in UTC (ET is UTC-4/-5) — exactness isn't critical
// because the processor only fires once scheduledFor has passed and it's after
// 8am ET.
function sendTimeFor(sessionDate: Date, offsetDays: number, sendHourEastern: number): Date {
  const d = new Date(sessionDate)
  d.setUTCDate(d.getUTCDate() - offsetDays)
  d.setUTCHours(sendHourEastern + 4, 0, 0, 0) // ET≈UTC-4; ~10am ET when hour=6... callers pass ET hour
  return d
}

// Turn a Booking into the set of ScheduledMessages it should produce, honoring
// the user's offsets and skipping reminders whose send time is already past.
// Build the reminder for a single offset (e.g. 3 days before), regardless of
// whether its send time is past — callers decide. Returns null only if the
// session date can't be parsed.
export function buildReminderForOffset(
  booking: Booking,
  settings: UserSettings,
  userId: string,
  offset: number,
  now: Date = new Date()
): ScheduledMessage | null {
  const sessionDate = parseSessionDate(booking.sessionDateISO) || parseSessionDate(booking.sessionTimeLabel)
  if (!sessionDate) return null

  const scheduledFor = sendTimeFor(sessionDate, offset, settings.sendHourEastern)
  const reminderType: ReminderType = `${offset}-day`
  const message = renderTemplate(settings.reminderTemplate, {
    name: booking.clientName,
    sessionTitle: booking.sessionTitle,
    sessionTime: booking.sessionTimeLabel,
    studioName: settings.studioName,
    email: booking.email,
    phone: booking.phone,
  })

  return {
    id: generateId(),
    clientName: booking.clientName,
    phone: booking.phone,
    email: booking.email,
    sessionTitle: booking.sessionTitle,
    sessionTime: booking.sessionTimeLabel,
    message,
    scheduledFor: scheduledFor.toISOString(),
    sessionDate: sessionDate.toISOString(),
    reminderType,
    status: 'scheduled',
    createdAt: now.toISOString(),
    userId,
    source: booking.source,
    externalId: booking.externalId,
    externalKey: dedupeKey(userId, booking, reminderType),
  }
}

// Turn a Booking into the set of NEW ScheduledMessages it should produce,
// honoring the user's offsets and skipping reminders whose send time is already
// past (we don't create a reminder that's already late).
export function buildReminders(
  booking: Booking,
  settings: UserSettings,
  userId: string,
  now: Date = new Date()
): ScheduledMessage[] {
  const out: ScheduledMessage[] = []
  for (const offset of settings.offsetsDays) {
    const r = buildReminderForOffset(booking, settings, userId, offset, now)
    if (r && new Date(r.scheduledFor).getTime() > now.getTime()) out.push(r)
  }
  return out
}

// Parse the numeric offset out of a reminderType like "3-day" -> 3. Returns null
// for non-offset types (manual, registration, test-*).
export function parseOffsetDays(reminderType: ReminderType): number | null {
  const m = /^(\d+)-day$/.exec(reminderType)
  return m ? Number(m[1]) : null
}

export interface ReconcilePlan {
  next: ScheduledMessage[]
  added: number
  updated: number
  cancelled: number
  skippedForQuota: number
}

// Reconcile a user's stored reminders against the live set of bookings for a
// given source. Pure (no I/O) so it can be unit-tested.
//   - cancel  : a pending reminder whose booking/slot is no longer active
//               (session deleted, cancelled, no-show, or no longer upcoming)
//   - update  : a pending reminder whose session's date/time/details changed
//   - add     : a newly-desired reminder (future send time) within SMS quota
// Only the user's still-'scheduled' reminders for `source` are touched; sent/
// failed reminders, other sources, and other users are preserved untouched.
export function reconcilePlan(
  all: ScheduledMessage[],
  userId: string,
  source: BookingSource,
  bookings: Booking[],
  settings: UserSettings,
  smsLimit: number,
  now: Date = new Date()
): ReconcilePlan {
  const isMine = (m: ScheduledMessage) =>
    m.userId === userId && m.status === 'scheduled' && m.source === source
  const mine = all.filter(isMine)
  const others = all.filter((m) => !isMine(m))

  const bookingBySlot = new Map<string, Booking>()
  for (const b of bookings) if (b.externalId) bookingBySlot.set(b.externalId, b)

  const kept: ScheduledMessage[] = []
  const keptKeys = new Set<string>()
  let updated = 0
  let cancelled = 0

  // 1) Existing pending reminders: cancel if the booking is gone, else keep
  //    (updating mutable fields if the session changed).
  for (const m of mine) {
    const booking = m.externalId ? bookingBySlot.get(m.externalId) : undefined
    if (!booking) {
      cancelled++ // session deleted / cancelled / no-show / no longer upcoming
      continue
    }
    const offset = parseOffsetDays(m.reminderType)
    const want = offset == null ? null : buildReminderForOffset(booking, settings, userId, offset, now)
    if (want) {
      const timeMoved = m.scheduledFor !== want.scheduledFor
      const wantPast = new Date(want.scheduledFor).getTime() <= now.getTime()
      // If a reschedule pushed this offset's send time into the past, its window
      // has passed — drop it. (A reminder that's merely due-but-unsent has an
      // UNCHANGED past send time and is kept so it still fires.)
      if (timeMoved && wantPast) {
        cancelled++
        continue
      }
      const changed =
        timeMoved ||
        m.message !== want.message ||
        m.sessionTime !== want.sessionTime ||
        m.sessionDate !== want.sessionDate ||
        m.sessionTitle !== want.sessionTitle ||
        m.clientName !== want.clientName ||
        m.phone !== want.phone ||
        m.email !== want.email
      if (changed) {
        m.scheduledFor = want.scheduledFor
        m.message = want.message
        m.sessionTime = want.sessionTime
        m.sessionDate = want.sessionDate
        m.sessionTitle = want.sessionTitle
        m.clientName = want.clientName
        m.phone = want.phone
        m.email = want.email
        updated++
      }
    }
    kept.push(m)
    if (m.externalKey) keptKeys.add(m.externalKey)
  }

  // 2) Add newly-desired (future) reminders not already present, within quota.
  const usedFixed = others.filter((m) => m.userId === userId).length
  let remaining = Math.max(0, smsLimit - usedFixed - kept.length)
  let added = 0
  let skippedForQuota = 0
  for (const b of bookings) {
    for (const d of buildReminders(b, settings, userId, now)) {
      if (d.externalKey && keptKeys.has(d.externalKey)) continue
      if (remaining <= 0) {
        skippedForQuota++
        continue
      }
      kept.push(d)
      if (d.externalKey) keptKeys.add(d.externalKey)
      added++
      remaining--
    }
  }

  return { next: [...others, ...kept], added, updated, cancelled, skippedForQuota }
}
