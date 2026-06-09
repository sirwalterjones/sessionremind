// Server-side Cloudflare Turnstile verification.
// Fail-open if no secret is configured (so a missing env var never locks every
// user out), fail-closed once configured if the token is missing/invalid.

export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured — don't block
  if (!token) return false

  try {
    const body = new URLSearchParams()
    body.append('secret', secret)
    body.append('response', token)
    if (ip) body.append('remoteip', ip)

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data = await res.json()
    return !!data?.success
  } catch (e) {
    console.error('Turnstile verification error:', e)
    return false
  }
}
