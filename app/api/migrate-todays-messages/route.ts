import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages, saveScheduledMessages } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || !currentUser.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all messages
    const allMessages = await getScheduledMessages()
    
    // Get today's date range
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    
    // Find potential messages to migrate
    const targetPhone = '6788978571'
    
    const candidateMessages = allMessages.filter(msg => {
      if (msg.userId) return false // Skip already attributed messages
      
      const cleanPhone = msg.phone?.replace(/[^\d]/g, '') || ''
      const phoneMatches = cleanPhone.includes(targetPhone) || cleanPhone.endsWith(targetPhone.slice(-7))
      
      const createdToday = msg.createdAt && new Date(msg.createdAt) >= todayStart && new Date(msg.createdAt) <= todayEnd
      const sentToday = msg.sentAt && new Date(msg.sentAt) >= todayStart && new Date(msg.sentAt) <= todayEnd
      
      return phoneMatches && (createdToday || sentToday)
    })

    return NextResponse.json({
      success: true,
      preview: true,
      message: `Found ${candidateMessages.length} message(s) that would be migrated`,
      searchCriteria: {
        targetPhone,
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString()
      },
      candidateMessages: candidateMessages.map(msg => ({
        id: msg.id,
        clientName: msg.clientName,
        phone: msg.phone,
        reminderType: msg.reminderType,
        status: msg.status,
        createdAt: msg.createdAt,
        sentAt: msg.sentAt
      })),
      instruction: "To actually migrate these messages, send a POST request to this endpoint"
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Preview failed',
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

    // Get all messages
    const allMessages = await getScheduledMessages()
    
    // Get today's date range
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    
    // Find messages sent today to 6788978571
    const targetPhone = '6788978571'
    const walterJonesUserId = '4f67e2ef-5f25-48fa-ba40-55449998b2e1'
    
    const todaysMessagesToTarget = allMessages.filter(msg => {
      // Check if message has no userId (orphaned)
      if (msg.userId) return false
      
      // Check if phone number matches (with various formats)
      const cleanPhone = msg.phone?.replace(/[^\d]/g, '') || ''
      const phoneMatches = cleanPhone.includes(targetPhone) || cleanPhone.endsWith(targetPhone.slice(-7))
      
      // Check if message was created or sent today
      const createdToday = msg.createdAt && new Date(msg.createdAt) >= todayStart && new Date(msg.createdAt) <= todayEnd
      const sentToday = msg.sentAt && new Date(msg.sentAt) >= todayStart && new Date(msg.sentAt) <= todayEnd
      
      return phoneMatches && (createdToday || sentToday)
    })

    if (todaysMessagesToTarget.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No messages found for today to 6788978571',
        searchCriteria: {
          targetPhone,
          todayStart: todayStart.toISOString(),
          todayEnd: todayEnd.toISOString()
        },
        availableMessages: allMessages
          .filter(msg => !msg.userId)
          .map(msg => ({
            id: msg.id,
            clientName: msg.clientName,
            phone: msg.phone,
            reminderType: msg.reminderType,
            status: msg.status,
            createdAt: msg.createdAt,
            sentAt: msg.sentAt
          }))
      })
    }

    // Update only today's messages to target phone
    const updatedMessages = allMessages.map(msg => {
      const isTargetMessage = todaysMessagesToTarget.some(target => target.id === msg.id)
      if (isTargetMessage) {
        return {
          ...msg,
          userId: walterJonesUserId
        }
      }
      return msg
    })

    // Save updated messages
    await saveScheduledMessages(updatedMessages)

    return NextResponse.json({
      success: true,
      message: `Successfully attributed ${todaysMessagesToTarget.length} message(s) sent today to 6788978571 to walter@joneswebdesigns.com`,
      migratedCount: todaysMessagesToTarget.length,
      migratedMessages: todaysMessagesToTarget.map(msg => ({
        id: msg.id,
        clientName: msg.clientName,
        phone: msg.phone,
        reminderType: msg.reminderType,
        status: msg.status,
        createdAt: msg.createdAt,
        sentAt: msg.sentAt
      })),
      targetUserId: walterJonesUserId
    })

  } catch (error) {
    console.error('Today migration error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 