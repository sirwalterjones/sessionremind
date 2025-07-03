import { NextRequest, NextResponse } from 'next/server'

// This endpoint can be called by external cron services like cron-job.org
// or by Vercel Cron Jobs to process scheduled messages

export async function GET(request: NextRequest) {
  try {
    // Optional: Add basic authentication
    const authHeader = request.headers.get('authorization')
    const expectedAuth = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call the background processor
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/process-scheduled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to process scheduled messages')
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: result.processed,
      messages: result.messages,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

// Also support POST for webhook-based cron services
export async function POST(request: NextRequest) {
  return GET(request)
}