import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages, saveScheduledMessages } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { specificMessageId, targetUserId } = await request.json()

    // Get all messages
    const allMessages = await getScheduledMessages()
    
    // Find the specific message to attribute
    const targetMessage = allMessages.find(msg => msg.id === specificMessageId)
    
    if (!targetMessage) {
      return NextResponse.json({
        error: 'Message not found',
        availableMessages: allMessages
          .filter(msg => !msg.userId)
          .map(msg => ({
            id: msg.id,
            clientName: msg.clientName,
            reminderType: msg.reminderType,
            status: msg.status,
            createdAt: msg.createdAt,
            sentAt: msg.sentAt
          }))
      }, { status: 404 })
    }

    // Update only this specific message
    const updatedMessages = allMessages.map(msg => {
      if (msg.id === specificMessageId) {
        return {
          ...msg,
          userId: targetUserId
        }
      }
      return msg
    })

    // Save updated messages
    await saveScheduledMessages(updatedMessages)

    return NextResponse.json({
      success: true,
      message: `Successfully attributed message to user`,
      updatedMessage: {
        id: targetMessage.id,
        clientName: targetMessage.clientName,
        reminderType: targetMessage.reminderType,
        status: targetMessage.status,
        createdAt: targetMessage.createdAt,
        newUserId: targetUserId
      }
    })

  } catch (error) {
    console.error('Attribution fix error:', error)
    return NextResponse.json({
      error: 'Attribution fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 