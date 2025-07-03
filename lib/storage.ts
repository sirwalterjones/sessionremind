// Simple file-based storage for scheduled messages
// In production, replace with a proper database

import fs from 'fs'
import path from 'path'

interface ScheduledMessage {
  id: string
  clientName: string
  phone: string
  message: string
  scheduledFor: string
  sessionDate: string
  reminderType: '3-day' | '1-day'
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
}

const STORAGE_FILE = path.join(process.cwd(), 'data', 'scheduled-messages.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(STORAGE_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

export function getScheduledMessages(): ScheduledMessage[] {
  try {
    ensureDataDir()
    if (!fs.existsSync(STORAGE_FILE)) {
      return []
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading scheduled messages:', error)
    return []
  }
}

export function saveScheduledMessages(messages: ScheduledMessage[]): void {
  try {
    ensureDataDir()
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(messages, null, 2))
  } catch (error) {
    console.error('Error saving scheduled messages:', error)
  }
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