import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, clearSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value

    if (sessionId) {
      await deleteSession(sessionId)
    }

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', clearSessionCookie())
    
    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}