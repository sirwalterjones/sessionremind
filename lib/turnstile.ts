// Server-side Cloudflare Turnstile verification.
//
// Fail-closed logic targets the dangerous misconfiguration the audit flagged:
// the widget is deployed (a public site key is set, so the browser renders it
// and submits tokens) but the server secret is missing — which would otherwise
// silently let everything through unverified. In that exact case, in
// production, we fail CLOSED.
//
// We deliberately do NOT fail closed when no site key is configured: that means
// Turnstile simply isn't deployed (e.g. a preview/build without it), so failing
// closed there would lock everyone out for no security benefit.
//
//   secret set                          -> verify normally (token required)
//   secret unset + site key set + prod  -> fail CLOSED (silent-bypass guard)
//   secret unset + no site key          -> fail OPEN (Turnstile not in use)
//   non-production                       -> fail OPEN (dev/preview convenience)

export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    const siteKeyConfigured = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (process.env.NODE_ENV === 'production' && siteKeyConfigured) {
      console.error(
        'Turnstile: site key is set but TURNSTILE_SECRET_KEY is missing in production — failing closed'
      )
      return false
    }
    return true // Turnstile not deployed here — don't block.
  }
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
