import { NextRequest, NextResponse } from 'next/server'
import { syncAllConnected } from '@/lib/sync'

// This endpoint can be called by external cron services like cron-job.org
// or by Vercel Cron Jobs to: (1) pull new UseSession bookings for every
// connected photographer and auto-schedule reminders, then (2) send any
// reminders that are now due.

export async function GET(request: NextRequest) {
  try {
    // Verify Vercel cron job or allow with optional auth
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel')
    const authHeader = request.headers.get('authorization')
    const expectedAuth = process.env.CRON_SECRET
    
    // Allow Vercel cron jobs automatically, otherwise check auth if secret is set
    if (!isVercelCron && expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('=== CRON JOB TRIGGERED ===')
    console.log('User Agent:', request.headers.get('user-agent'))
    console.log('Timestamp:', new Date().toISOString())

    // 1) Pull new bookings from UseSession for all connected photographers and
    //    auto-schedule reminders. Never let a sync failure block sending.
    let syncSummary: { users: number; totalScheduled: number } | { error: string }
    try {
      syncSummary = await syncAllConnected()
      console.log('UseSession sync:', JSON.stringify(syncSummary))
    } catch (syncError) {
      console.error('UseSession sync failed (continuing to send):', syncError)
      syncSummary = { error: String(syncError instanceof Error ? syncError.message : syncError) }
    }

    // 2) Call the background processor directly (internal call)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    
    const response = await fetch(`${baseUrl}/api/process-scheduled`, {
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
      sync: syncSummary,
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