import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages } from '@/lib/storage'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's database record for current usage
    const userData = await kv.hgetall(`user:${currentUser.id}`)
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's scheduled messages to analyze activity
    const allScheduledMessages = await getScheduledMessages()
    const userMessages = allScheduledMessages.filter(msg => msg.userId === currentUser.id)

    // Count messages by status
    const sentMessages = userMessages.filter(msg => msg.status === 'sent')
    const scheduledMessages = userMessages.filter(msg => msg.status === 'scheduled')
    const failedMessages = userMessages.filter(msg => msg.status === 'failed')

    // Calculate activity metrics
    const totalMessages = userMessages.length
    const deliveryRate = totalMessages > 0 ? Math.round((sentMessages.length / totalMessages) * 100) : 0

    // Group by reminder type
    const messagesByType = userMessages.reduce((acc, msg) => {
      acc[msg.reminderType] = (acc[msg.reminderType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentMessages = userMessages.filter(msg => 
      new Date(msg.createdAt) >= thirtyDaysAgo
    )

    // Daily activity for the past 7 days
    const dailyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayMessages = userMessages.filter(msg => {
        const messageDate = new Date(msg.createdAt)
        return messageDate >= dayStart && messageDate <= dayEnd
      })

      dailyActivity.push({
        date: dayStart.toISOString().split('T')[0],
        count: dayMessages.length,
        sent: dayMessages.filter(msg => msg.status === 'sent').length
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email
      },
      activity: {
        // Current usage from database
        currentUsage: Number(userData.sms_usage) || 0,
        limit: Number(userData.sms_limit) || 500,
        
        // Message history analysis
        totalMessages,
        messagesByStatus: {
          sent: sentMessages.length,
          scheduled: scheduledMessages.length,
          failed: failedMessages.length
        },
        messagesByType,
        
        // Performance metrics
        deliveryRate,
        
        // Recent activity
        recentActivity: {
          last30Days: recentMessages.length,
          dailyActivity
        },
        
        // Latest messages
        latestMessages: userMessages
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(msg => ({
            id: msg.id,
            clientName: msg.clientName,
            reminderType: msg.reminderType,
            status: msg.status,
            createdAt: msg.createdAt,
            scheduledFor: msg.scheduledFor,
            sentAt: msg.sentAt
          }))
      }
    })

  } catch (error) {
    console.error('User SMS activity error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 