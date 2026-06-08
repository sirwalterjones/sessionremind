// Canonical shared types for the reminder pipeline.
// One source of truth so the form, importers (UseSession sync / CSV / paste),
// the scheduler, and the cron processor all speak the same shape.

export type ReminderType =
  | '3-day'
  | '1-day'
  | 'manual'
  | 'registration'
  | 'test-2min'
  | 'test-5min'
  | string // allow configurable offsets like '7-day', '2-day'

export type BookingSource = 'usesession' | 'csv' | 'paste' | 'manual'

// A normalized booking — whatever the source (UseSession API, CSV, paste, manual),
// everything is converted to this before scheduling.
export interface Booking {
  // Stable id from the source (e.g. UseSession slot id) used to de-duplicate
  // reminders across repeated syncs. Falls back to phone+date when absent.
  externalId?: string
  source: BookingSource
  clientName: string
  phone: string
  email: string
  sessionTitle: string
  // ISO timestamp of the actual session start (used for scheduling math).
  sessionDateISO: string
  // Human-friendly label shown to the client / used in templates.
  sessionTimeLabel: string
}

export interface ScheduledMessage {
  id: string
  clientName: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  scheduledFor: string
  sessionDate: string
  reminderType: ReminderType
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
  userId: string
  source?: BookingSource
  // De-dupe key: `${userId}:${externalId|phone+date}:${reminderType}`.
  externalKey?: string
}

export interface UseSessionConnection {
  connected: boolean
  connectedAt?: string
  lastSyncAt?: string
  lastSyncStatus?: 'ok' | 'error'
  lastSyncError?: string
  lastSyncBookings?: number
  businessName?: string
  // The viewer field that lists the photographer's sessions, discovered at
  // connect-time via introspection (e.g. "flites"). Avoids hard-coding a guess.
  listField?: string
}

export interface UserSettings {
  // Studio/business name used in templates. Auto-filled from UseSession
  // `viewer.business_name` on connect; never hard-coded.
  studioName: string
  reminderTemplate: string
  registrationTemplate: string
  // Days before the session to send reminders, e.g. [3, 1].
  offsetsDays: number[]
  // Hour (Eastern) to send reminders on the offset day.
  sendHourEastern: number
  // When true, new synced bookings auto-schedule reminders immediately.
  autoSchedule: boolean
  usesession: UseSessionConnection
}
