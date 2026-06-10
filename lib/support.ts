// Support/contact ticket storage (Vercel KV).
// Tickets are created by the public /contact form, handled by an admin in
// /admin/support, and the requester is emailed replies via Resend.

import { kv } from '@vercel/kv'
import { generateId } from './auth'

export type TicketStatus = 'open' | 'replied' | 'closed'
export type TicketTopic = 'support' | 'billing' | 'bug' | 'general'

export interface TicketReply {
  message: string
  at: string // ISO
  adminName?: string
}

export interface SupportTicket {
  id: string
  name: string
  email: string
  topic: TicketTopic
  message: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
  // Set when the requester was logged in, so admin can jump to the account.
  userId?: string
  username?: string
  replies: TicketReply[]
}

const TICKET_KEY = (id: string) => `support:ticket:${id}`
const TICKET_INDEX = 'support:tickets' // list of ids, newest first
const MAX_LIST = 300

export async function createTicket(
  input: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'replies'>
): Promise<SupportTicket> {
  const now = new Date().toISOString()
  const ticket: SupportTicket = {
    ...input,
    id: generateId(),
    status: 'open',
    createdAt: now,
    updatedAt: now,
    replies: [],
  }
  await kv.set(TICKET_KEY(ticket.id), ticket)
  await kv.lpush(TICKET_INDEX, ticket.id)
  return ticket
}

export async function getTicket(id: string): Promise<SupportTicket | null> {
  try {
    return (await kv.get<SupportTicket>(TICKET_KEY(id))) || null
  } catch (error) {
    console.error('getTicket error:', error)
    return null
  }
}

export async function saveTicket(ticket: SupportTicket): Promise<void> {
  ticket.updatedAt = new Date().toISOString()
  await kv.set(TICKET_KEY(ticket.id), ticket)
}

export async function listTickets(status?: TicketStatus): Promise<SupportTicket[]> {
  try {
    const ids = (await kv.lrange<string>(TICKET_INDEX, 0, MAX_LIST - 1)) || []
    if (!ids.length) return []
    const raw = await kv.mget<(SupportTicket | null)[]>(...ids.map(TICKET_KEY))
    const tickets = (raw || []).filter(Boolean) as SupportTicket[]
    return status ? tickets.filter((t) => t.status === status) : tickets
  } catch (error) {
    console.error('listTickets error:', error)
    return []
  }
}

export async function countOpenTickets(): Promise<number> {
  const tickets = await listTickets('open')
  return tickets.length
}
