import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getScheduledMessages } from '@/lib/storage'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get raw user data from KV
    const userData = await kv.hgetall(`user:${currentUser.id}`)
    
    // Get all messages and filter by user
    const allMessages = await getScheduledMessages()
    const userMessages = allMessages.filter(msg => msg.userId === currentUser.id)
    
    // Get admin status from auth context vs KV storage
    const authUserData = {
      id: currentUser.id,
      email: currentUser.email,
      username: currentUser.username,
      is_admin: currentUser.is_admin,
      sms_usage: currentUser.sms_usage,
      sms_limit: currentUser.sms_limit
    }

    return NextResponse.json({
      success: true,
      debug: {
        authUserData,
        kvUserData: userData || {},
        userMessages: userMessages.map(msg => ({
          id: msg.id,
          clientName: msg.clientName,
          reminderType: msg.reminderType,
          status: msg.status,
          userId: msg.userId,
          createdAt: msg.createdAt,
          sentAt: msg.sentAt
        })),
        summary: {
          userIdFromAuth: currentUser.id,
          isAdminFromAuth: currentUser.is_admin,
          isAdminFromKV: userData?.is_admin || false,
          smsUsageFromAuth: currentUser.sms_usage,
          smsUsageFromKV: userData?.sms_usage || 0,
          smsLimitFromKV: userData?.sms_limit || 500,
          messagesFoundForUser: userMessages.length
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 