import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { listTickets, TicketStatus } from '@/lib/support'

// Admin-only: list support tickets (newest first), optionally by status.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const statusParam = request.nextUrl.searchParams.get('status') || ''
  const status = ['open', 'replied', 'closed'].includes(statusParam)
    ? (statusParam as TicketStatus)
    : undefined

  const tickets = await listTickets(status)
  return NextResponse.json({ tickets })
}
