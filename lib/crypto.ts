// AES-256-GCM encryption for secrets stored at rest (e.g. a photographer's
// UseSession access token). The token grants access to their UseSession account
// and client PII, so it must never be stored in plaintext.

import crypto from 'crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.CRON_SECRET || ''
  if (!secret) {
    console.warn(
      '⚠️ ENCRYPTION_KEY is not set — falling back to an insecure dev key. ' +
        'Set ENCRYPTION_KEY (a long random string) in your environment for production.'
    )
  }
  // Derive a stable 32-byte key from whatever secret is available.
  return crypto.createHash('sha256').update(secret || 'insecure-dev-key-change-me').digest()
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // iv.tag.ciphertext, all base64
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.')
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Malformed ciphertext')
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8')
}
