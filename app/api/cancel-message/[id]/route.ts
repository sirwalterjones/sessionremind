import { NextRequest, NextResponse } from 'next/server'
import { getScheduledMessages, saveScheduledMessages } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id
    console.log(`Attempting to cancel message: ${messageId}`)
    
    // Get all scheduled messages
    const messages = await getScheduledMessages()
    
    // Find the message to cancel
    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }
    
    const message = messages[messageIndex]
    
    // Only allow cancellation of scheduled messages
    if (message.status !== 'scheduled') {
      return NextResponse.json(
        { error: `Cannot cancel message with status: ${message.status}` },
        { status: 400 }
      )
    }
    
    // Remove the message from the list
    messages.splice(messageIndex, 1)
    
    // Save updated messages
    await saveScheduledMessages(messages)
    
    console.log(`✅ Successfully cancelled message ${messageId} for ${message.clientName}`)
    
    return NextResponse.json({
      success: true,
      message: 'Message cancelled successfully',
      cancelledMessage: {
        id: message.id,
        clientName: message.clientName,
        reminderType: message.reminderType,
        scheduledFor: message.scheduledFor
      }
    })
    
  } catch (error) {
    console.error('Error cancelling message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}