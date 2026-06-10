import { NextRequest, NextResponse } from 'next/server'
import { syncAllConnected } from '@/lib/sync'
import { pollPendingVerifications } from '@/lib/provisioning'
import { billPendingOverage } from '@/lib/usage'

// This endpoint can be called by external cron services like cron-job.org
// or by Vercel Cron Jobs to: (1) pull new UseSession bookings for every
// connected photographer and auto-schedule reminders, (2) poll pending
// toll-free verifications (auto-emailing studios on approval/rejection),
// (3) send any reminders that are now due, then (4) bill accrued SMS overage
// as Stripe invoice items.

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

    // 2) Poll pending toll-free verifications; auto-emails studios when Twilio
    //    approves/rejects. Never let this block sending.
    let verifySummary: { checked: number } | { error: string }
    try {
      verifySummary = await pollPendingVerifications()
      console.log('Toll-free verification poll:', JSON.stringify(verifySummary))
    } catch (verifyError) {
      console.error('Verification poll failed (continuing to send):', verifyError)
      verifySummary = { error: String(verifyError instanceof Error ? verifyError.message : verifyError) }
    }

    // 3) Call the background processor (internal call, authenticated with the
    //    cron secret). Never let a processing failure block overage billing.
    let result: { processed?: number; messages?: unknown; error?: string }
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

      const response = await fetch(`${baseUrl}/api/process-scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(expectedAuth ? { authorization: `Bearer ${expectedAuth}` } : {}),
        },
      })
      if (!response.ok) throw new Error(`process-scheduled returned ${response.status}`)
      result = await response.json()
    } catch (processError) {
      console.error('Message processing failed (continuing to billing):', processError)
      result = { error: String(processError instanceof Error ? processError.message : processError) }
    }

    // 4) Bill any un-billed SMS overage as Stripe invoice items (swept onto
    //    each customer's next subscription invoice). Never blocks the cron.
    let overageSummary: Awaited<ReturnType<typeof billPendingOverage>> | { error: string }
    try {
      overageSummary = await billPendingOverage()
      if (overageSummary.customersBilled || overageSummary.errors) {
        console.log('Overage billing:', JSON.stringify(overageSummary))
      }
    } catch (overageError) {
      console.error('Overage billing failed:', overageError)
      overageSummary = { error: String(overageError instanceof Error ? overageError.message : overageError) }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sync: syncSummary,
      verification: verifySummary,
      processed: result.processed,
      messages: result.messages,
      overage: overageSummary,
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