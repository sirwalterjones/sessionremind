// Password-reset tokens, stored in KV with a 1h TTL. Mirrors lib/email-verify.ts.

import crypto from 'crypto'
import { kv } from '@vercel/kv'

const TTL_SECONDS = 60 * 60 // 1h

export async function createResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(24).toString('hex')
  await kv.set(`pwreset:${token}`, userId, { ex: TTL_SECONDS })
  return token
}

// Single-use: returns the userId and deletes the token.
export async function consumeResetToken(token: string): Promise<string | null> {
  if (!token) return null
  const userId = await kv.get<string>(`pwreset:${token}`)
  if (userId) await kv.del(`pwreset:${token}`)
  return userId || null
}
