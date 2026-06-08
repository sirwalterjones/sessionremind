// Short-lived pairing codes for the no-extension "Connect" flow.
//
// The photographer generates a code in the app (authenticated), then a one-time
// "Connect" bookmarklet on app.usesession.com reads their token and POSTs
// { code, token } to /api/usesession/connect-token. The code maps back to their
// userId, so attribution works without cross-site cookies and the token travels
// only in a POST body over HTTPS (never in a URL).

import { randomBytes } from 'crypto'
import { kv } from '@vercel/kv'

const TTL_SECONDS = 600 // 10 minutes
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no ambiguous 0/O/1/I/L

function generateCode(): string {
  const bytes = randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i] % ALPHABET.length]
  return code
}

export async function createPairingCode(userId: string): Promise<{ code: string; ttl: number }> {
  const code = generateCode()
  await kv.set(`uspair:${code}`, userId, { ex: TTL_SECONDS })
  return { code, ttl: TTL_SECONDS }
}

// Resolve and consume (single-use) a pairing code -> userId.
export async function consumePairingCode(code: string): Promise<string | null> {
  if (!code) return null
  const key = `uspair:${code.toUpperCase().trim()}`
  const userId = await kv.get<string>(key)
  if (userId) await kv.del(key)
  return userId || null
}
