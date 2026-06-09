import { NextRequest, NextResponse } from 'next/server'
import { consumeVerifyToken } from '@/lib/email-verify'
import { kv } from '@vercel/kv'

// Clicked from the verification email. Consumes the token, marks the user
// verified, and redirects to the status page.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token') || ''
  const base = url.origin

  const userId = await consumeVerifyToken(token)
  if (!userId) {
    return NextResponse.redirect(`${base}/verify-email?status=expired`)
  }
  await kv.hset(`user:${userId}`, { email_verified: true })
  return NextResponse.redirect(`${base}/verify-email?status=success`)
}
