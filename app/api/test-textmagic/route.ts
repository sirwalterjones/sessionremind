import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.TEXTMAGIC_API_KEY;
    const username = process.env.TEXTMAGIC_USERNAME;

    if (!apiKey || !username) {
      return NextResponse.json(
        { error: 'TextMagic credentials not configured' },
        { status: 500 }
      );
    }

    // Test API connection by getting account info
    const response = await fetch('https://rest.textmagic.com/api/v2/user', {
      method: 'GET',
      headers: {
        'X-TM-Username': username,
        'X-TM-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TextMagic API test failed:', errorText);
      return NextResponse.json(
        { 
          error: 'TextMagic API authentication failed',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'TextMagic API connection successful',
      user: {
        username: result.username,
        firstName: result.firstName,
        lastName: result.lastName,
        balance: result.balance,
        currency: result.currency
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}