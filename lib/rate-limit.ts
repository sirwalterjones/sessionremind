import { kv } from '@vercel/kv'
import { NextRequest } from 'next/server'

// Lightweight fixed-window rate limiter backed by KV (same approach as the
// /contact form, generalized). Fail-OPEN on a KV error so a transient storage
// blip never locks legitimate users out of logging in.

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

// Increment the counter at `key` and allow up to `limit` hits per `windowSec`.
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  try {
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, windowSec)
    if (count > limit) {
      const ttl = await kv.ttl(key)
      return { ok: false, remaining: 0, retryAfterSeconds: ttl > 0 ? ttl : windowSec }
    }
    return { ok: true, remaining: Math.max(0, limit - count), retryAfterSeconds: 0 }
  } catch (e) {
    console.error('rateLimit error (failing open):', e)
    return { ok: true, remaining: limit, retryAfterSeconds: 0 }
  }
}

// Best-effort client IP from the proxy header; 'unknown' groups together when
// absent (still better than no limit).
export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

// Standard 429 body + Retry-After header.
export function tooManyRequests(message: string, retryAfterSeconds: number) {
  return Response.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  )
}
