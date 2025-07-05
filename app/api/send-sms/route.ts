import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const body: SMSRequest = await request.json()
    console.log('=== SMS API RECEIVED ===')
    console.log('Full request body:', JSON.stringify(body, null, 2))
    console.log('Phone:', body.phone)
    console.log('Name:', body.name)
    console.log('Opted in:', body.optedIn)
    console.log('Scheduling enabled:', body.schedulingEnabled)
    console.log('========================')

    if (!body.optedIn) {
      console.log('SMS rejected: Client not opted in')
      return NextResponse.json(
        { error: 'Client has not opted in to SMS reminders' },
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

    return NextResponse.json({
      success: true,
      id: result.id,
      message: 'SMS sent successfully',
      textMagicResponse: result,
    })
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}