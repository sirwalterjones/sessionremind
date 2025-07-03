import { NextRequest, NextResponse } from 'next/server'
import { getScheduledMessages, addScheduledMessage } from '@/lib/storage'

interface ScheduleRequest {
  name: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  optedIn: boolean
  schedulingEnabled: boolean
  threeDayReminder: boolean
  oneDayReminder: boolean
  testMode?: boolean // Flag for test mode
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
  reminderType: '3-day' | '1-day' | 'test-2min' | 'test-5min'
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ScheduleRequest = await request.json()
    console.log('Schedule API received data:', data)

    if (!data.optedIn) {
      console.log('Rejecting: Client not opted in')
      return NextResponse.json(
        { error: 'Client has not opted in to SMS reminders' },
        { status: 400 }
      )
    }

    if (!data.schedulingEnabled) {
      console.log('Rejecting: Scheduling not enabled')
      return NextResponse.json(
        { error: 'Scheduling is not enabled' },
        { status: 400 }
      )
    }

    // Parse session date
    const sessionDate = parseSessionDate(data.sessionTime)
    console.log('Session date parsed as:', sessionDate)

    const personalizedMessage = data.message
      .replace(/{name}/g, data.name)
      .replace(/{sessionTitle}/g, data.sessionTitle)
      .replace(/{sessionTime}/g, data.sessionTime)

    const reminders: ScheduledMessage[] = []

    if (data.testMode) {
      // TEST MODE: Schedule for 2 minutes and 5 minutes from now
      console.log('Test mode enabled - scheduling short-interval reminders')
      
      const now = new Date()
      
      // Schedule 2-minute test reminder
      if (data.threeDayReminder) {
        const twoMinutesLater = new Date(now)
        twoMinutesLater.setMinutes(twoMinutesLater.getMinutes() + 2)

        reminders.push({
          id: generateId(),
          clientName: data.name,
          phone: data.phone,
          email: data.email,
          sessionTitle: data.sessionTitle,
          sessionTime: data.sessionTime,
          message: `[TEST 2-MIN] ${personalizedMessage}`,
          scheduledFor: twoMinutesLater.toISOString(),
          sessionDate: sessionDate?.toISOString() || new Date().toISOString(),
          reminderType: 'test-2min',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        })
      }

      // Schedule 5-minute test reminder
      if (data.oneDayReminder) {
        const fiveMinutesLater = new Date(now)
        fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5)

        reminders.push({
          id: generateId(),
          clientName: data.name,
          phone: data.phone,
          email: data.email,
          sessionTitle: data.sessionTitle,
          sessionTime: data.sessionTime,
          message: `[TEST 5-MIN] ${personalizedMessage}`,
          scheduledFor: fiveMinutesLater.toISOString(),
          sessionDate: sessionDate?.toISOString() || new Date().toISOString(),
          reminderType: 'test-5min',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        })
      }
    } else {
      // NORMAL MODE: Standard 3-day and 1-day reminders
      // Parse session date
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
    }

    // Store scheduled messages persistently
    reminders.forEach(reminder => addScheduledMessage(reminder))

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
  const scheduledMessages = getScheduledMessages()
  return NextResponse.json({
    scheduledMessages: scheduledMessages.map(msg => ({
      id: msg.id,
      clientName: msg.clientName,
      phone: msg.phone,
      sessionDate: msg.sessionDate,
      reminderType: msg.reminderType,
      scheduledFor: msg.scheduledFor,
      status: msg.status,
      createdAt: msg.createdAt,
    }))
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
    
    console.error('All parsing strategies failed for:', sessionTime)
    return null
    
  } catch (error) {
    console.error('Date parsing error:', error)
    return null
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}