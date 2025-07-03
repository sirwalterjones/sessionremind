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

    // Clean phone number - TextMagic expects full international format
    let cleanPhone = body.phone.replace(/[^\d+]/g, '')
    
    // Ensure phone has proper international format
    if (!cleanPhone.startsWith('+')) {
      // If no country code, assume US (+1)
      if (cleanPhone.length === 10) {
        cleanPhone = '+1' + cleanPhone
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        cleanPhone = '+' + cleanPhone
      } else {
        cleanPhone = '+1' + cleanPhone
      }
    }
    
    console.log('Original phone:', body.phone)
    console.log('Cleaned phone:', cleanPhone)

    // Send enrollment confirmation first
    const enrollmentMessage = `✅ Your number has been successfully enrolled in text alerts for your Moments by Candice - Photography session. You'll receive reminders as your session approaches.`
    
    const enrollmentPayload = {
      text: enrollmentMessage,
      phones: cleanPhone
    }
    console.log('Sending enrollment confirmation:', enrollmentPayload)

    const enrollmentResponse = await fetch('https://rest.textmagic.com/api/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TM-Username': username,
        'X-TM-Key': apiKey,
      },
      body: JSON.stringify(enrollmentPayload),
    })

    let enrollmentResult = null
    if (!enrollmentResponse.ok) {
      const enrollmentError = await enrollmentResponse.text()
      console.error('Enrollment SMS failed:', enrollmentError)
      // Continue with main message even if enrollment fails
    } else {
      enrollmentResult = await enrollmentResponse.json()
      console.log('Enrollment SMS sent:', enrollmentResult)
    }

    // Send the main message if it's different from enrollment
    let mainResult = null
    if (body.message.trim() !== enrollmentMessage.trim()) {
      const mainPayload = {
        text: body.message,
        phones: cleanPhone
      }
      console.log('Sending main message:', mainPayload)

      const response = await fetch('https://rest.textmagic.com/api/v2/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TM-Username': username,
          'X-TM-Key': apiKey,
        },
        body: JSON.stringify(mainPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Main message TextMagic API error:', errorText)
        // Don't fail completely if enrollment worked
        if (enrollmentResult) {
          console.log('Main message failed but enrollment succeeded')
        } else {
          return NextResponse.json(
            { error: 'Failed to send SMS via TextMagic API' },
            { status: response.status }
          )
        }
      } else {
        mainResult = await response.json()
        console.log('Main SMS sent:', mainResult)
      }
    }

    return NextResponse.json({
      success: true,
      id: mainResult?.id || enrollmentResult?.id,
      message: 'SMS sent successfully',
      enrollmentSent: !!enrollmentResult,
      mainMessageSent: !!mainResult,
      textMagicResponse: {
        enrollment: enrollmentResult,
        main: mainResult
      },
    })
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}