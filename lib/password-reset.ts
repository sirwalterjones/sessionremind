// Password-reset tokens, stored in KV with a 1h TTL. Mirrors lib/email-verify.ts.

import crypto from 'crypto'
import { kv } from '@vercel/kv'

const TTL_SECONDS = 60 * 60 // 1h

export async function createResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(24).toString('hex')
  await kv.set(`pwreset:${token}`, userId, { ex: TTL_SECONDS })
  return token
}

// Single-use: atomically returns the userId and deletes the token, so two
// concurrent requests can't both consume the same token (GETDEL is atomic,
// unlike a separate get-then-del).
export async function consumeResetToken(token: string): Promise<string | null> {
  if (!token) return null
  return (await kv.getdel<string>(`pwreset:${token}`)) || null
}
