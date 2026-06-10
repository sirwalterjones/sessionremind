import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getTicket, saveTicket, TicketStatus } from '@/lib/support'
import { sendSupportReplyEmail } from '@/lib/email'

// Admin-only ticket actions:
//   PATCH { status }   -> change ticket status (open/closed)
//   POST  { message }  -> reply: appends to the thread, emails the requester,
//                         and marks the ticket 'replied'

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !user.is_admin) return null
  return user
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticket = await getTicket(params.id)
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const status = body.status as TicketStatus
  if (!['open', 'replied', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  ticket.status = status
  await saveTicket(ticket)
  return NextResponse.json({ ticket })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticket = await getTicket(params.id)
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const message = String(body.message || '').trim().slice(0, 4000)
  if (!message) return NextResponse.json({ error: 'Reply message is required' }, { status: 400 })

  // Email first — if Resend fails, don't record a reply the requester never got.
  const sent = await sendSupportReplyEmail(ticket.email, ticket.name, ticket.message, message)
  if (!sent) {
    return NextResponse.json(
      { error: 'Could not send the reply email — nothing was saved. Try again.' },
      { status: 502 }
    )
  }

  ticket.replies.push({ message, at: new Date().toISOString(), adminName: admin.username })
  ticket.status = 'replied'
  await saveTicket(ticket)
  return NextResponse.json({ ticket })
}
