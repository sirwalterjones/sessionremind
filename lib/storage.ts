// Temporary in-memory storage for scheduled messages
// WARNING: This storage is not persistent across server restarts
// In production, replace with a proper database (Redis, PostgreSQL, etc.)

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

// In-memory storage - will be lost on server restart
let scheduledMessages: ScheduledMessage[] = []

export function getScheduledMessages(): ScheduledMessage[] {
  return [...scheduledMessages] // Return a copy to prevent mutations
}

export function saveScheduledMessages(messages: ScheduledMessage[]): void {
  scheduledMessages = [...messages]
  console.log(`📝 Saved ${messages.length} scheduled messages to memory`)
}

export function addScheduledMessage(message: ScheduledMessage): void {
  const messages = getScheduledMessages()
  messages.push(message)
  saveScheduledMessages(messages)
}

export function updateMessageStatus(id: string, status: 'sent' | 'failed'): void {
  const messages = getScheduledMessages()
  const message = messages.find(m => m.id === id)
  if (message) {
    message.status = status
    saveScheduledMessages(messages)
  }
}

export function getScheduledMessagesPendingDelivery(): ScheduledMessage[] {
  const messages = getScheduledMessages()
  const now = new Date()
  
  return messages.filter(msg => {
    if (msg.status !== 'scheduled') return false
    
    const scheduledTime = new Date(msg.scheduledFor)
    // Send if scheduled time has passed
    return scheduledTime <= now
  })
}