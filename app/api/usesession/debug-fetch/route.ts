import { NextRequest, NextResponse } from 'next/server'

// TEMPORARY diagnostic endpoint — REMOVE after diagnosing the connect 401.
// Tests whether Vercel's servers can reach UseSession's API, and reports the
// egress IP. Gated by a secret query param. Token is supplied by the caller.

const SECRET = 'usesess-diag-9f3k2'
const Q = '{ viewer { id business_name } }'

async function hit(auth: string, ua?: string) {
  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      authorization: auth,
    }
    if (ua) headers['user-agent'] = ua
    const res = await fetch('https://api.usesession.com/query', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: Q }),
    })
    const body = await res.text()
    return { status: res.status, body: body.replace(/\s+/g, ' ').slice(0, 220) }
  } catch (e: any) {
    return { error: String(e?.message || e) }
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  if (url.searchParams.get('secret') !== SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const token = (url.searchParams.get('token') || '').trim()
  const bearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`

  const out: any = { tokenLen: token.length, tokenHead: token.slice(0, 12), tokenTail: token.slice(-8) }
  out.bearer = await hit(bearer)
  out.raw = await hit(token)
  out.bearerBrowserUA = await hit(
    bearer,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  )
  try {
    const ip = await fetch('https://api.ipify.org?format=json')
    out.egressIp = (await ip.text()).slice(0, 120)
  } catch (e: any) {
    out.egressIp = String(e?.message || e)
  }
  return NextResponse.json(out)
}
