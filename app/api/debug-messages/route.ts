import { NextRequest, NextResponse } from 'next/server'
import { getScheduledMessages } from '@/lib/storage'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    const allMessages = await getScheduledMessages()
    
    return NextResponse.json({
      currentUser: user ? { id: user.id, email: user.email, is_admin: user.is_admin } : null,
      totalMessages: allMessages.length,
      messages: allMessages.map(msg => ({
        id: msg.id,
        clientName: msg.clientName,
        reminderType: msg.reminderType,
        status: msg.status,
        userId: msg.userId || 'NO_USER_ID',
        createdAt: msg.createdAt,
        sentAt: msg.sentAt
      })),
      userSpecificMessages: user ? allMessages.filter(msg => msg.userId === user.id).length : 0
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 