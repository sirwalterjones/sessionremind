import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { buildReminders, cleanPhone, monthlyQuotaUsed } from '@/lib/reminders'
import { getUserSettings } from '@/lib/settings'
import {
  addScheduledMessages,
  getExistingExternalKeys,
  getScheduledMessages,
} from '@/lib/storage'
import { Booking } from '@/lib/types'

// Normalized ingestion endpoint. CSV import (and any future paste/import) POSTs
// a list of bookings here; it reuses the same engine as the UseSession sync:
// build reminders -> de-dupe -> enforce quota -> schedule.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rows: any[]
  try {
    const body = await request.json()
    rows = Array.isArray(body?.bookings) ? body.bookings : []
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!rows.length) {
    return NextResponse.json({ error: 'No bookings to import' }, { status: 400 })
  }

  const settings = await getUserSettings(user.id, user.username)
  const now = new Date()
  const existingKeys = await getExistingExternalKeys(user.id)
  // Monthly quota (same semantics as the auto-sync scheduler): this month's
  // sends + pending, against the included texts plus overage headroom for
  // users with a real Stripe subscription. Previously this counted every
  // message ever stored, permanently blocking imports on established accounts.
  const smsLimit = Number(user.sms_limit) || 500
  const overageCap = user.stripe_subscription_id ? smsLimit : 0
  const used = monthlyQuotaUsed(await getScheduledMessages(), user.id, now)
  let remaining = Math.max(0, smsLimit + overageCap - used)

  const toAdd = []
  let skippedInvalid = 0
  let skippedForQuota = 0

  for (const r of rows) {
    const phone = (r.phone || '').toString()
    const sessionDateISO = (r.sessionDateISO || '').toString()
    if (cleanPhone(phone).length !== 10 || !sessionDateISO) {
      skippedInvalid++
      continue
    }
    const booking: Booking = {
      externalId: r.externalId ? String(r.externalId) : `csv:${cleanPhone(phone)}@${sessionDateISO}`,
      source: 'csv',
      clientName: (r.clientName || '').toString(),
      phone,
      email: (r.email || '').toString(),
      sessionTitle: (r.sessionTitle || 'Session').toString(),
      sessionDateISO,
      sessionTimeLabel: (r.sessionTimeLabel || '').toString(),
    }
    const reminders = buildReminders(booking, settings, user.id, now).filter(
      (rem) => !rem.externalKey || !existingKeys.has(rem.externalKey)
    )
    for (const rem of reminders) {
      if (remaining <= 0) {
        skippedForQuota++
        continue
      }
      toAdd.push(rem)
      remaining--
    }
  }

  const scheduled = await addScheduledMessages(toAdd)
  return NextResponse.json({
    success: true,
    rows: rows.length,
    scheduled,
    skippedInvalid,
    skippedForQuota,
  })
}
