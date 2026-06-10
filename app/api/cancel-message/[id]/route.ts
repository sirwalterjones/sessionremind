import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages, deleteScheduledMessage } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require a session and only ever act on the caller's own messages — this
    // route is hit from the dashboard. (It previously had no auth and operated
    // on the global message list, letting anyone delete any tenant's reminder
    // by guessing its id.)
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const messageId = params.id

    // Look up within the caller's own messages so we can honor the
    // scheduled-only rule and return a 404 (not a tamper) for anything else.
    const messages = await getScheduledMessages()
    const message = messages.find((msg) => msg.id === messageId && msg.userId === user.id)

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.status !== 'scheduled') {
      return NextResponse.json(
        { error: `Cannot cancel message with status: ${message.status}` },
        { status: 400 }
      )
    }

    // Owner-scoped delete (no-op for any id the caller doesn't own).
    const removed = await deleteScheduledMessage(messageId, user.id)
    if (!removed) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    console.log(`✅ Cancelled message ${messageId} for ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Message cancelled successfully',
      cancelledMessage: {
        id: message.id,
        clientName: message.clientName,
        reminderType: message.reminderType,
        scheduledFor: message.scheduledFor,
      },
    })
  } catch (error) {
    console.error('Error cancelling message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
