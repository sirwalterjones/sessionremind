import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSettings, patchUserSettings } from '@/lib/settings'
import { UserSettings } from '@/lib/types'

// GET — the current user's settings (studio name, templates, reminder offsets).
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const settings = await getUserSettings(user.id, user.username)
  return NextResponse.json({ settings })
}

// PUT — update the editable settings fields. Connection internals (token, sync
// status) are intentionally NOT editable here.
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Partial<UserSettings>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const patch: Partial<UserSettings> = {}
  if (typeof body.studioName === 'string') patch.studioName = body.studioName.slice(0, 100)
  if (typeof body.reminderTemplate === 'string') patch.reminderTemplate = body.reminderTemplate.slice(0, 1000)
  if (typeof body.registrationTemplate === 'string')
    patch.registrationTemplate = body.registrationTemplate.slice(0, 1000)
  if (typeof body.sendHourEastern === 'number')
    patch.sendHourEastern = Math.min(20, Math.max(6, Math.round(body.sendHourEastern)))
  if (typeof body.autoSchedule === 'boolean') patch.autoSchedule = body.autoSchedule
  if (typeof body.emailReminders === 'boolean') patch.emailReminders = body.emailReminders
  if (Array.isArray(body.offsetsDays)) {
    const offsets = body.offsetsDays
      .map((n) => Math.round(Number(n)))
      .filter((n) => Number.isFinite(n) && n >= 0 && n <= 30)
    // de-dupe + sort descending (3 then 1)
    patch.offsetsDays = Array.from(new Set(offsets)).sort((a, b) => b - a)
  }

  const settings = await patchUserSettings(user.id, patch, user.username)
  return NextResponse.json({ success: true, settings })
}
