import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { deleteScheduledMessage, updateScheduledMessage } from '@/lib/storage'

// PATCH — edit a scheduled reminder (message text / send time / cancel).
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const patch: any = {}
  if (typeof body.message === 'string') patch.message = body.message.slice(0, 1000)
  if (typeof body.scheduledFor === 'string') patch.scheduledFor = body.scheduledFor
  // Allow cancelling (-> 'failed' acts as cancelled) or re-activating.
  if (body.status === 'scheduled' || body.status === 'failed') patch.status = body.status

  const updated = await updateScheduledMessage(params.id, user.id, patch)
  if (!updated) return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
  return NextResponse.json({ success: true, message: updated })
}

// DELETE — remove a scheduled reminder.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await deleteScheduledMessage(params.id, user.id)
  if (!ok) return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
