import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages } from '@/lib/storage'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user data from KV
    const userData = await kv.hgetall(`user:${currentUser.id}`)
    
    // Get all scheduled messages
    const allScheduledMessages = await getScheduledMessages()
    
    // Filter for this user's messages
    const userMessages = allScheduledMessages.filter(msg => msg.userId === currentUser.id)
    
    // Get some sample messages for debugging
    const sampleMessages = allScheduledMessages.slice(0, 5).map(msg => ({
      id: msg.id,
      clientName: msg.clientName,
      userId: msg.userId,
      status: msg.status,
      createdAt: msg.createdAt
    }))

    return NextResponse.json({
      success: true,
      debug: {
        currentUser: {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email
        },
        userData: userData || 'No user data found',
        messageCount: {
          total: allScheduledMessages.length,
          userSpecific: userMessages.length
        },
        userMessages: userMessages.map(msg => ({
          id: msg.id,
          clientName: msg.clientName,
          status: msg.status,
          reminderType: msg.reminderType,
          createdAt: msg.createdAt
        })),
        sampleAllMessages: sampleMessages
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 