import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages, saveScheduledMessages } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all messages
    const allMessages = await getScheduledMessages()
    
    // Find orphaned messages (no userId)
    const orphanedMessages = allMessages.filter(msg => !msg.userId)
    
    // Target user ID for walter@joneswebdesigns.com
    const walterJonesUserId = '4f67e2ef-5f25-48fa-ba40-55449998b2e1'
    
    if (orphanedMessages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned messages found',
        migratedCount: 0
      })
    }

    // Update orphaned messages to attribute them to walter@joneswebdesigns.com
    const updatedMessages = allMessages.map(msg => {
      if (!msg.userId) {
        return {
          ...msg,
          userId: walterJonesUserId
        }
      }
      return msg
    })

    // Save updated messages back to storage
    await saveScheduledMessages(updatedMessages)

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${orphanedMessages.length} orphaned messages to walter@joneswebdesigns.com`,
      migratedCount: orphanedMessages.length,
      migratedMessages: orphanedMessages.map(msg => ({
        id: msg.id,
        clientName: msg.clientName,
        reminderType: msg.reminderType,
        status: msg.status,
        createdAt: msg.createdAt
      })),
      targetUserId: walterJonesUserId
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 