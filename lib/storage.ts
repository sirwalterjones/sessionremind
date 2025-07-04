// Persistent storage for scheduled messages using Vercel KV (Redis)
// This ensures messages survive server restarts and work across serverless instances

import { kv } from '@vercel/kv'

interface ScheduledMessage {
  id: string
  clientName: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  scheduledFor: string
  sessionDate: string
  reminderType: '3-day' | '1-day' | 'test-2min' | 'test-5min'
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
}

const STORAGE_KEY = 'scheduled-messages'

export async function getScheduledMessages(): Promise<ScheduledMessage[]> {
  try {
    const messages = await kv.get<ScheduledMessage[]>(STORAGE_KEY)
    console.log('🔍 Retrieved from KV:', JSON.stringify(messages, null, 2))
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
  console.log('🔍 Adding message to storage:', JSON.stringify(message, null, 2))
  const messages = await getScheduledMessages()
  messages.push(message)
  console.log('🔍 All messages before save:', JSON.stringify(messages, null, 2))
  await saveScheduledMessages(messages)
  
  // Verify by reading back
  const savedMessages = await getScheduledMessages()
  const savedMessage = savedMessages.find(m => m.id === message.id)
  console.log('🔍 Message after save verification:', JSON.stringify(savedMessage, null, 2))
}

export async function updateMessageStatus(id: string, status: 'sent' | 'failed'): Promise<void> {
  const messages = await getScheduledMessages()
  const message = messages.find(m => m.id === id)
  if (message) {
    message.status = status
    await saveScheduledMessages(messages)
  }
}

export async function getScheduledMessagesPendingDelivery(): Promise<ScheduledMessage[]> {
  const messages = await getScheduledMessages()
  const now = new Date()
  
  return messages.filter(msg => {
    if (msg.status !== 'scheduled') return false
    
    const scheduledTime = new Date(msg.scheduledFor)
    // Send if scheduled time has passed
    return scheduledTime <= now
  })
}