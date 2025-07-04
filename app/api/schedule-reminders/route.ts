import { NextRequest, NextResponse } from 'next/server'
import { addScheduledMessage, getScheduledMessages } from '@/lib/storage'

interface ScheduleRequest {
  name: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  optedIn: boolean
  threeDayReminder: boolean
  oneDayReminder: boolean
}

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
  reminderType: '3-day' | '1-day'
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ScheduleRequest = await request.json()
    
    console.log('Schedule API received data:', data)
    
    if (!data.optedIn) {
      return NextResponse.json(
        { error: 'Client must opt in to receive SMS reminders' },
        { status: 400 }
      )
    }

    // Personalize the message
    const personalizedMessage = data.message
      .replace(/{name}/g, data.name)
      .replace(/{sessionTitle}/g, data.sessionTitle)
      .replace(/{sessionTime}/g, data.sessionTime)
      .replace(/{email}/g, data.email)
      .replace(/{phone}/g, data.phone)

    const reminders: ScheduledMessage[] = []
    
    // Parse session date
    console.log('Parsing session time:', data.sessionTime)
    const sessionDate = parseSessionDate(data.sessionTime)
    console.log('Session date parsed as:', sessionDate)
    
    if (!sessionDate) {
      console.log('Rejecting: Could not parse session date:', data.sessionTime)
      return NextResponse.json(
        { error: `Could not parse session date: "${data.sessionTime}". Please use format like "July 5th, 2025 at 7:30 PM"` },
        { status: 400 }
      )
    }

    // Schedule 3-day reminder
    if (data.threeDayReminder) {
      const threeDaysEarlier = new Date(sessionDate)
      threeDaysEarlier.setDate(threeDaysEarlier.getDate() - 3)
      threeDaysEarlier.setHours(10, 0, 0, 0) // 10:00 AM

      reminders.push({
        id: generateId(),
        clientName: data.name,
        phone: data.phone,
        email: data.email,
        sessionTitle: data.sessionTitle,
        sessionTime: data.sessionTime,
        message: personalizedMessage,
        scheduledFor: threeDaysEarlier.toISOString(),
        sessionDate: sessionDate.toISOString(),
        reminderType: '3-day',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      })
    }

    // Schedule 1-day reminder
    if (data.oneDayReminder) {
      const oneDayEarlier = new Date(sessionDate)
      oneDayEarlier.setDate(oneDayEarlier.getDate() - 1)
      oneDayEarlier.setHours(10, 0, 0, 0) // 10:00 AM

      reminders.push({
        id: generateId(),
        clientName: data.name,
        phone: data.phone,
        email: data.email,
        sessionTitle: data.sessionTitle,
        sessionTime: data.sessionTime,
        message: personalizedMessage,
        scheduledFor: oneDayEarlier.toISOString(),
        sessionDate: sessionDate.toISOString(),
        reminderType: '1-day',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      })
    }

    // Store scheduled messages persistently
    console.log('📝 About to store reminders:', reminders)
    for (const reminder of reminders) {
      console.log('💾 Storing reminder:', JSON.stringify(reminder, null, 2))
      await addScheduledMessage(reminder)
    }
    console.log('✅ All reminders stored successfully')

    return NextResponse.json({
      success: true,
      message: `${reminders.length} reminder(s) scheduled successfully`,
      scheduledReminders: reminders.map(r => ({
        id: r.id,
        type: r.reminderType,
        scheduledFor: r.scheduledFor,
      })),
    })
  } catch (error) {
    console.error('Schedule API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const scheduledMessages = await getScheduledMessages()
  return NextResponse.json({
    scheduledMessages: scheduledMessages
  })
}

function parseSessionDate(sessionTime: string): Date | null {
  try {
    console.log('Parsing session time:', sessionTime)
    
    // Clean up the input string
    let dateStr = sessionTime.trim()
    
    // Try multiple parsing strategies
    const strategies = [
      // Strategy 1: Direct parsing with cleanup
      () => {
        let cleaned = dateStr.toLowerCase()
        // Remove ordinals
        cleaned = cleaned.replace(/(\d+)(st|nd|rd|th)/g, '$1')
        // Remove day of week
        cleaned = cleaned.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i, '')
        // Handle time ranges
        cleaned = cleaned.replace(/(\d{1,2}:\d{2}\s*(am|pm))\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/i, '$1')
        // Replace " at " with space
        cleaned = cleaned.replace(/ at /g, ' ')
        console.log('Strategy 1 cleaned:', cleaned)
        return new Date(cleaned)
      },
      
      // Strategy 2: Manual parsing for common formats
      () => {
        // Match: "July 10th, 2025 at 2:00 PM"
        const match = dateStr.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})\s+(?:at\s+)?(\d{1,2}):(\d{2})\s*(AM|PM)/i)
        if (match) {
          const [, month, day, year, hour, minute, ampm] = match
          const date = new Date(`${month} ${day}, ${year} ${hour}:${minute} ${ampm}`)
          console.log('Strategy 2 parsed:', date)
          return date
        }
        return null
      },
      
      // Strategy 3: Try with just date part if time parsing fails
      () => {
        const datePart = dateStr.split(' at ')[0] || dateStr.split(/\d{1,2}:\d{2}/)[0]
        if (datePart) {
          let cleaned = datePart.replace(/(\d+)(st|nd|rd|th)/g, '$1')
          cleaned = cleaned.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i, '')
          const date = new Date(cleaned + ' 12:00 PM') // Default to noon
          console.log('Strategy 3 parsed (date only):', date)
          return date
        }
        return null
      },
      
      // Strategy 4: Try original string with minimal cleanup
      () => {
        const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1')
        console.log('Strategy 4 cleaned:', cleaned)
        return new Date(cleaned)
      }
    ]
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = strategies[i]()
        if (result && !isNaN(result.getTime()) && result.getFullYear() > 2020) {
          console.log(`Strategy ${i + 1} successful:`, result)
          return result
        }
      } catch (e) {
        console.log(`Strategy ${i + 1} failed:`, e instanceof Error ? e.message : 'Unknown error')
      }
    }
    
    console.log('All parsing strategies failed')
    return null
  } catch (error) {
    console.error('Parse error:', error)
    return null
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}