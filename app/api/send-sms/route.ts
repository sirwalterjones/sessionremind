import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { kv } from '@vercel/kv'
import { addScheduledMessage } from '@/lib/storage'

interface SMSRequest {
  name: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  optedIn: boolean
  schedulingEnabled?: boolean
  threeDayReminder?: boolean
  oneDayReminder?: boolean
}

// Helper function to check if current time is before 8am EST
function isBeforeEightAmEST(): boolean {
  const now = new Date()
  
  // Get Eastern Time (automatically handles EST/EDT)
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  const easternHour = easternTime.getHours()
  
  console.log(`Current UTC time: ${now.toISOString()}`)
  console.log(`Eastern time: ${easternTime.toLocaleString("en-US", {timeZone: "America/New_York"})}`)
  console.log(`Eastern hour: ${easternHour}`)
  
  return easternHour < 8
}

export async function POST(request: NextRequest) {
  try {
    // Get current user to track SMS usage
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: SMSRequest = await request.json()
    console.log('=== SMS API RECEIVED ===')
    console.log('Full request body:', JSON.stringify(body, null, 2))
    console.log('Phone:', body.phone)
    console.log('Name:', body.name)
    console.log('Opted in:', body.optedIn)
    console.log('Scheduling enabled:', body.schedulingEnabled)
    console.log('User ID:', currentUser.id)
    console.log('========================')

    if (!body.optedIn) {
      console.log('SMS rejected: Client not opted in')
      return NextResponse.json(
        { error: 'Client has not opted in to SMS reminders' },
        { status: 400 }
      )
    }

    // Check if it's too early to send messages (before 8am EST)
    if (isBeforeEightAmEST()) {
      console.log('⏰ SMS rejected: Time restriction - before 8am EST')
      return NextResponse.json(
        { error: 'Messages cannot be sent before 8am EST' },
        { status: 400 }
      )
    }

    const apiKey = process.env.TEXTMAGIC_API_KEY
    const username = process.env.TEXTMAGIC_USERNAME

    console.log('API Key exists:', !!apiKey)
    console.log('Username exists:', !!username)

    if (!apiKey || !username) {
      console.log('SMS rejected: Missing credentials')
      return NextResponse.json(
        { error: 'TextMagic API credentials not configured' },
        { status: 500 }
      )
    }

    // Clean phone number - TextMagic expects numbers without + prefix
    let cleanPhone = body.phone.replace(/[^\d]/g, '')
    
    // Ensure 10-digit US format (TextMagic doesn't want + prefix)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      cleanPhone = cleanPhone.substring(1) // Remove leading 1
    } else if (cleanPhone.length !== 10) {
      // If not 10 digits, assume US and pad/trim as needed
      if (cleanPhone.length > 10) {
        cleanPhone = cleanPhone.substring(cleanPhone.length - 10)
      }
    }
    
    console.log('Original phone:', body.phone)
    console.log('Cleaned phone:', cleanPhone)

    // Replace template variables in the message
    let finalMessage = body.message
      .replace(/{name}/g, body.name)
      .replace(/{sessionTitle}/g, body.sessionTitle)
      .replace(/{sessionTime}/g, body.sessionTime)
      .replace(/{email}/g, body.email)
      .replace(/{phone}/g, body.phone)

    const smsPayload = {
      text: finalMessage,
      phones: cleanPhone
    }
    console.log('Sending SMS:', smsPayload)

    const response = await fetch('https://rest.textmagic.com/api/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TM-Username': username,
        'X-TM-Key': apiKey,
      },
      body: JSON.stringify(smsPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SMS failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to send SMS via TextMagic API' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('SMS sent:', result)

    // Update user's SMS usage counter
    try {
      const userData = await kv.hgetall(`user:${currentUser.id}`)
      if (userData) {
        const currentUsage = Number(userData.sms_usage) || 0
        const newUsage = currentUsage + 1
        await kv.hset(`user:${currentUser.id}`, { sms_usage: newUsage })
        console.log(`Updated SMS usage for user ${currentUser.id}: ${currentUsage} -> ${newUsage}`)
      }
    } catch (error) {
      console.error('Failed to update SMS usage counter:', error)
      // Don't fail the SMS send if usage tracking fails
    }

    // Store the sent message in persistent storage so it appears on user's dashboard
    try {
      const sentMessage = {
        id: `sent_${result.id || Date.now()}`,
        clientName: body.name,
        phone: body.phone,
        email: body.email,
        sessionTitle: body.sessionTitle,
        sessionTime: body.sessionTime,
        message: finalMessage,
        scheduledFor: new Date().toISOString(), // When it was sent
        sessionDate: body.sessionTime ? new Date(body.sessionTime).toISOString() : new Date().toISOString(),
        reminderType: 'manual' as '3-day' | '1-day',
        status: 'sent' as 'scheduled' | 'sent' | 'failed',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        userId: currentUser.id
      }
      
      await addScheduledMessage(sentMessage)
      console.log(`Stored sent message for user ${currentUser.id}: ${body.name}`)
    } catch (error) {
      console.error('Failed to store sent message:', error)
      // Don't fail the SMS send if storage fails
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'SMS sent successfully',
      textMagicResponse: result,
      userSmsUsage: currentUser.sms_usage ? Number(currentUser.sms_usage) + 1 : 1
    })
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}