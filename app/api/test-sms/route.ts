import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    const apiKey = process.env.TEXTMAGIC_API_KEY;
    const username = process.env.TEXTMAGIC_USERNAME;

    if (!apiKey || !username) {
      return NextResponse.json(
        { error: 'TextMagic credentials not configured' },
        { status: 500 }
      );
    }

    // Clean phone number for TextMagic
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Remove leading +1 for US numbers
    if (cleanPhone.startsWith('+1')) {
      cleanPhone = cleanPhone.substring(2);
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }

    console.log('Testing SMS to:', cleanPhone);

    const payload = {
      text: message || 'Test message from Moments by Candice',
      phones: cleanPhone
    };

    console.log('TextMagic test payload:', payload);

    const response = await fetch('https://rest.textmagic.com/api/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TM-Username': username,
        'X-TM-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('TextMagic raw response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'TextMagic API error',
          details: responseText,
          status: response.status,
          payload: payload
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      result: result,
      sentTo: cleanPhone
    });

  } catch (error) {
    console.error('Test SMS error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}