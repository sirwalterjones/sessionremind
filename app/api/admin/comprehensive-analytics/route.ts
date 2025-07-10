import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const apiKey = process.env.TEXTMAGIC_API_KEY
    const username = process.env.TEXTMAGIC_USERNAME

    if (!apiKey || !username) {
      return NextResponse.json({
        error: 'TextMagic API credentials not configured'
      }, { status: 500 })
    }

    const headers = {
      'X-TM-Username': username,
      'X-TM-Key': apiKey,
      'Content-Type': 'application/json'
    }

    // Get URL search params for time filtering
    const { searchParams } = new URL(request.url)
    const startTime = searchParams.get('start') // Unix timestamp
    const endTime = searchParams.get('end') // Unix timestamp
    const groupBy = searchParams.get('by') || 'off' // off, day, month, year

    // Build query params for TextMagic
    const queryParams = new URLSearchParams()
    if (startTime) queryParams.append('start', startTime)
    if (endTime) queryParams.append('end', endTime)
    if (groupBy) queryParams.append('by', groupBy)

    // Fetch multiple analytics endpoints in parallel
    const [
      messagingStatsResponse,
      spendingStatsResponse,
      userAccountResponse
    ] = await Promise.all([
      // Messaging statistics
      fetch(`https://rest.textmagic.com/api/v2/stats/messaging?${queryParams.toString()}`, {
        method: 'GET',
        headers
      }),
      
      // Spending statistics  
      fetch(`https://rest.textmagic.com/api/v2/stats/spending?limit=50`, {
        method: 'GET',
        headers
      }),
      
      // User account info
      fetch('https://rest.textmagic.com/api/v2/user', {
        method: 'GET',
        headers
      })
    ])

    // Parse responses
    const messagingStats = messagingStatsResponse.ok ? await messagingStatsResponse.json() : null
    const spendingStats = spendingStatsResponse.ok ? await spendingStatsResponse.json() : null
    const userAccount = userAccountResponse.ok ? await userAccountResponse.json() : null

    // Process messaging statistics
    let processedMessagingStats = null
    if (messagingStats && Array.isArray(messagingStats)) {
      // Calculate totals across all periods
      const totals = messagingStats.reduce((acc, period) => ({
        totalCosts: acc.totalCosts + (period.costs || 0),
        totalDelivered: acc.totalDelivered + (period.messagesSentDelivered || 0),
        totalFailed: acc.totalFailed + (period.messagesSentFailed || 0),
        totalRejected: acc.totalRejected + (period.messagesSentRejected || 0),
        totalReceived: acc.totalReceived + (period.messagesReceived || 0),
        totalParts: acc.totalParts + (period.messagesSentParts || 0)
      }), {
        totalCosts: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalRejected: 0,
        totalReceived: 0,
        totalParts: 0
      })

      const totalSent = totals.totalDelivered + totals.totalFailed + totals.totalRejected
      const overallDeliveryRate = totalSent > 0 ? (totals.totalDelivered / totalSent * 100) : 0
      const overallReplyRate = totalSent > 0 ? (totals.totalReceived / totalSent * 100) : 0

      processedMessagingStats = {
        periods: messagingStats,
        totals: {
          ...totals,
          totalSent,
          overallDeliveryRate: Math.round(overallDeliveryRate * 10) / 10,
          overallReplyRate: Math.round(overallReplyRate * 10) / 10,
          averageCostPerMessage: totalSent > 0 ? Math.round((totals.totalCosts / totalSent) * 10000) / 10000 : 0
        }
      }
    }

    // Process spending statistics
    let processedSpendingStats = null
    if (spendingStats?.resources) {
      const recentTransactions = spendingStats.resources.slice(0, 10)
      const totalSpending = spendingStats.resources
        .filter((item: any) => item.delta < 0) // Only spending (negative deltas)
        .reduce((sum: number, item: any) => sum + Math.abs(item.delta), 0)

      processedSpendingStats = {
        recentTransactions,
        totalSpending,
        pagination: {
          page: spendingStats.page,
          limit: spendingStats.limit,
          pageCount: spendingStats.pageCount
        }
      }
    }

    // Process account information
    let processedAccountInfo = null
    if (userAccount) {
      processedAccountInfo = {
        username: userAccount.username,
        firstName: userAccount.firstName,
        lastName: userAccount.lastName,
        email: userAccount.email,
        balance: userAccount.balance,
        currency: userAccount.currency,
        timezone: userAccount.timezone,
        company: userAccount.company
      }
    }

    return NextResponse.json({
      success: true,
      timeRange: {
        start: startTime,
        end: endTime,
        groupBy
      },
      messaging: processedMessagingStats,
      spending: processedSpendingStats,
      account: processedAccountInfo,
      raw: {
        messagingSuccess: messagingStatsResponse.ok,
        spendingSuccess: spendingStatsResponse.ok,
        accountSuccess: userAccountResponse.ok
      }
    })

  } catch (error) {
    console.error('Comprehensive analytics error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 