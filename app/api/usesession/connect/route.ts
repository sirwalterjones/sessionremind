import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { connectUseSession } from '@/lib/usesession-connect'

// POST { token } — connect a photographer's UseSession account by pasting their
// token directly into the app (authenticated). The token is validated, stored
// encrypted, the studio name is auto-filled, and an initial sync runs.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let token: string
  try {
    const body = await request.json()
    token = (body?.token || '').toString().trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!token) {
    return NextResponse.json({ error: 'Missing UseSession token' }, { status: 400 })
  }

  try {
    const result = await connectUseSession(user.id, user.username, token)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('connect: connectUseSession failed:', error)
    return NextResponse.json(
      {
        error: 'That token did not work. Make sure you are logged into UseSession and try again.',
        detail: String((error as any)?.message || error),
      },
      { status: 400 }
    )
  }
}
