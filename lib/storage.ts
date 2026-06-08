// Persistent storage for scheduled messages using Vercel KV (Redis)
// This ensures messages survive server restarts and work across serverless instances

import { kv } from '@vercel/kv'
import { ScheduledMessage } from './types'

// Re-export so existing imports `from '@/lib/storage'` keep working.
export type { ScheduledMessage }

const STORAGE_KEY = 'scheduled-messages'

export async function getScheduledMessages(): Promise<ScheduledMessage[]> {
  try {
    const messages = await kv.get<ScheduledMessage[]>(STORAGE_KEY)
    return messages || []
  } catch (error) {
    console.error('Error reading scheduled messages from KV:', error)
    return []
  }
}

export async function saveScheduledMessages(messages: ScheduledMessage[]): Promise<void> {
  try {
    await kv.set(STORAGE_KEY, messages)
    console.log(`📝 Saved ${messages.length} scheduled messages to Vercel KV`)
  } catch (error) {
    console.error('Error saving scheduled messages to KV:', error)
  }
}

export async function addScheduledMessage(message: ScheduledMessage): Promise<void> {
  // CRITICAL: Validate that message has userId attribution
  if (!message.userId) {
    console.error('🚨 CRITICAL ERROR: Attempted to store message without userId!', {
      id: message.id,
      clientName: message.clientName,
      reminderType: message.reminderType,
      status: message.status
    })
    throw new Error('Message must have userId attribution before storage')
  }

  console.log(`✅ Storing message with proper userId attribution: ${message.userId}`, {
    id: message.id,
    clientName: message.clientName,
    reminderType: message.reminderType
  })

  const messages = await getScheduledMessages()
  messages.push(message)
  await saveScheduledMessages(messages)
}

// Batch add with de-duplication by externalKey. Does a single read-modify-write
// per call (instead of one per message) and skips messages whose externalKey
// already exists, so repeated syncs don't create duplicate reminders.
// Returns the number actually added.
export async function addScheduledMessages(newMessages: ScheduledMessage[]): Promise<number> {
  if (!newMessages.length) return 0
  for (const m of newMessages) {
    if (!m.userId) throw new Error('Message must have userId attribution before storage')
  }
  const existing = await getScheduledMessages()
  const seen = new Set(existing.map((m) => m.externalKey).filter(Boolean))
  const toAdd = newMessages.filter((m) => !m.externalKey || !seen.has(m.externalKey))
  if (!toAdd.length) return 0
  await saveScheduledMessages([...existing, ...toAdd])
  return toAdd.length
}

// All externalKeys already stored for a user (for dedupe checks before building).
export async function getExistingExternalKeys(userId: string): Promise<Set<string>> {
  const messages = await getScheduledMessages()
  return new Set(
    messages.filter((m) => m.userId === userId && m.externalKey).map((m) => m.externalKey as string)
  )
}

// Count a user's scheduled + sent messages (for quota enforcement).
export async function countUserMessages(userId: string): Promise<number> {
  const messages = await getScheduledMessages()
  return messages.filter((m) => m.userId === userId).length
}

export async function updateMessageStatus(id: string, status: 'sent' | 'failed'): Promise<void> {
  const messages = await getScheduledMessages()
  const message = messages.find(m => m.id === id)
  if (message) {
    message.status = status
    if (status === 'sent') {
      message.sentAt = new Date().toISOString()
    }
    await saveScheduledMessages(messages)
  }
}

// Helper function to check if current time is before 8am EST
function isBeforeEightAmEST(): boolean {
  const now = new Date()
  
  // Get Eastern Time (automatically handles EST/EDT)
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  const easternHour = easternTime.getHours()
  
  return easternHour < 8
}

export async function getScheduledMessagesPendingDelivery(): Promise<ScheduledMessage[]> {
  const messages = await getScheduledMessages()
  const now = new Date()
  
  return messages.filter(msg => {
    if (msg.status !== 'scheduled') return false
    
    const scheduledTime = new Date(msg.scheduledFor)
    // Send if scheduled time has passed AND it's after 8am EST
    return scheduledTime <= now && !isBeforeEightAmEST()
  })
}