import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get ALL messages in the database
    const allMessages = await getScheduledMessages()
    
    // Group by userId
    const messagesByUser = allMessages.reduce((acc, msg) => {
      const userId = msg.userId || 'NO_USER_ID'
      if (!acc[userId]) acc[userId] = []
      acc[userId].push({
        id: msg.id,
        clientName: msg.clientName,
        phone: msg.phone,
        reminderType: msg.reminderType,
        status: msg.status,
        createdAt: msg.createdAt,
        sentAt: msg.sentAt
      })
      return acc
    }, {} as Record<string, any[]>)
    
    return NextResponse.json({
      success: true,
      debug: {
        totalMessages: allMessages.length,
        messagesByUser,
        messagesWithoutUserId: allMessages.filter(msg => !msg.userId).length,
        targetUserIds: {
          walterjonesjr: '3eb5c5f5-b2e4-4e03-a5d8-a55c3adae0b3',
          walterjoneswebdesigns: '4f67e2ef-5f25-48fa-ba40-55449998b2e1'
        },
        allMessagesRaw: allMessages.map(msg => ({
          id: msg.id,
          clientName: msg.clientName,
          phone: msg.phone,
          reminderType: msg.reminderType,
          status: msg.status,
          userId: msg.userId || 'MISSING_USER_ID',
          createdAt: msg.createdAt,
          sentAt: msg.sentAt
        }))
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 