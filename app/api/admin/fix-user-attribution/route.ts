import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages, saveScheduledMessages } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const allMessages = await getScheduledMessages()
    const orphanedMessages = allMessages.filter(msg => !msg.userId)

    return NextResponse.json({
      success: true,
      orphanedCount: orphanedMessages.length,
      orphanedMessages: orphanedMessages.map(msg => ({
        id: msg.id,
        clientName: msg.clientName,
        phone: msg.phone,
        reminderType: msg.reminderType,
        status: msg.status,
        createdAt: msg.createdAt,
        sentAt: msg.sentAt
      })),
      userIds: {
        walterjonesjr: '3eb5c5f5-b2e4-4e03-a5d8-a55c3adae0b3',
        walterjoneswebdesigns: '4f67e2ef-5f25-48fa-ba40-55449998b2e1'
      },
      actions: {
        fixTodaysMessages: 'POST /api/admin/fix-user-attribution with {"action": "fix-todays-messages", "targetPhone": "6788978571"}',
        fixSpecificMessage: 'POST /api/admin/fix-user-attribution with {"action": "fix-specific", "messageId": "ID", "userId": "USER_ID"}'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get attribution status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { action, targetPhone, messageId, userId } = await request.json()
    const allMessages = await getScheduledMessages()

    if (action === 'fix-todays-messages') {
      // Fix messages sent today to specific phone number
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      
      const walterJonesUserId = '4f67e2ef-5f25-48fa-ba40-55449998b2e1'
      
      const todaysMessages = allMessages.filter(msg => {
        if (msg.userId) return false
        
        const cleanPhone = msg.phone?.replace(/[^\d]/g, '') || ''
        const phoneMatches = cleanPhone.includes(targetPhone) || cleanPhone.endsWith(targetPhone.slice(-7))
        
        const createdToday = msg.createdAt && new Date(msg.createdAt) >= todayStart && new Date(msg.createdAt) <= todayEnd
        const sentToday = msg.sentAt && new Date(msg.sentAt) >= todayStart && new Date(msg.sentAt) <= todayEnd
        
        return phoneMatches && (createdToday || sentToday)
      })

      const updatedMessages = allMessages.map(msg => {
        const isTargetMessage = todaysMessages.some(target => target.id === msg.id)
        return isTargetMessage ? { ...msg, userId: walterJonesUserId } : msg
      })

      await saveScheduledMessages(updatedMessages)

      return NextResponse.json({
        success: true,
        action: 'fix-todays-messages',
        fixed: todaysMessages.length,
        fixedMessages: todaysMessages.map(msg => ({
          id: msg.id,
          clientName: msg.clientName,
          phone: msg.phone,
          reminderType: msg.reminderType
        }))
      })

    } else if (action === 'fix-specific' && messageId && userId) {
      // Fix specific message
      const updatedMessages = allMessages.map(msg => {
        return msg.id === messageId ? { ...msg, userId } : msg
      })

      await saveScheduledMessages(updatedMessages)

      const fixedMessage = allMessages.find(msg => msg.id === messageId)

      return NextResponse.json({
        success: true,
        action: 'fix-specific',
        fixedMessage: fixedMessage ? {
          id: fixedMessage.id,
          clientName: fixedMessage.clientName,
          reminderType: fixedMessage.reminderType,
          newUserId: userId
        } : null
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({
      error: 'Fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 