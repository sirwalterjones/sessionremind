// Email-verification tokens, stored in KV with a 24h TTL.

import crypto from 'crypto'
import { kv } from '@vercel/kv'

const TTL_SECONDS = 60 * 60 * 24 // 24h

export async function createVerifyToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(24).toString('hex')
  await kv.set(`emailverify:${token}`, userId, { ex: TTL_SECONDS })
  return token
}

// Single-use: returns the userId and deletes the token.
export async function consumeVerifyToken(token: string): Promise<string | null> {
  if (!token) return null
  const userId = await kv.get<string>(`emailverify:${token}`)
  if (userId) await kv.del(`emailverify:${token}`)
  return userId || null
}
