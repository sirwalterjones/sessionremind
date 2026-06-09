import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/auth'
import { consumePairingCode } from '@/lib/pairing'
import { connectUseSession } from '@/lib/usesession-connect'

// Cross-origin endpoint hit by the one-time "Connect" bookmarklet running on
// app.usesession.com. Attribution is via the single-use pairing code (not a
// cookie), so CORS is open — the code is the secret.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  let code = ''
  let token = ''
  try {
    const body = await request.json()
    code = (body?.code || '').toString().trim()
    token = (body?.token || '').toString().trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: CORS_HEADERS })
  }

  if (!code || !token) {
    return NextResponse.json(
      { error: 'Missing pairing code or token' },
      { status: 400, headers: CORS_HEADERS }
    )
  }

  const userId = await consumePairingCode(code)
  if (!userId) {
    return NextResponse.json(
      { error: 'That connect code has expired. Generate a new one in SessionRemind and try again.' },
      { status: 401, headers: CORS_HEADERS }
    )
  }

  const user = await getUserById(userId)
  try {
    const result = await connectUseSession(userId, user?.username || '', token)
    return NextResponse.json({ success: true, ...result }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('connect-token: connectUseSession failed:', error)
    return NextResponse.json(
      {
        error: 'Could not validate your UseSession token. Make sure you are logged in and try again.',
        detail: String((error as any)?.message || error),
      },
      { status: 400, headers: CORS_HEADERS }
    )
  }
}
