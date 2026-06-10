// SSRF guard for server-side fetches of user-supplied URLs (the UseSession
// booking-page extractors). We only ever fetch public Session/UseSession pages,
// so we hard-allowlist those hosts and reject everything else — including the
// cloud metadata endpoint and private ranges that a substring check like
// `url.includes('session.com')` would happily pass
// (e.g. http://169.254.169.254/?x=session.com or http://session.com.evil.tld).

const ALLOWED_HOST_SUFFIXES = ['session.com', 'usesession.com']

// Blocks literal-IP hosts that point at the loopback/private/link-local ranges
// (link-local 169.254.0.0/16 covers the 169.254.169.254 metadata address).
function isPrivateIpHost(host: string): boolean {
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const [a, b] = v4.slice(1).map(Number)
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    return false
  }
  // IPv6 loopback / unique-local / link-local.
  const h = host.replace(/^\[|\]$/g, '').toLowerCase()
  return h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')
}

// Returns the validated URL string, or null if it must not be fetched.
export function validateExtractUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null

  const host = parsed.hostname.toLowerCase()
  if (isPrivateIpHost(host)) return null

  const allowed = ALLOWED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  )
  if (!allowed) return null

  return parsed.toString()
}
