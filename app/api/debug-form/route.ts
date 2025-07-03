import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== FORM DEBUG ===');
    console.log('Received form data:', JSON.stringify(body, null, 2));
    console.log('==================');

    return NextResponse.json({
      success: true,
      message: 'Form data received successfully',
      receivedData: body
    });

  } catch (error) {
    console.error('Debug form error:', error);
    return NextResponse.json(
      { error: 'Debug form error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}