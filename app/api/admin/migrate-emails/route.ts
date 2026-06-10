import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser, normalizeEmail } from '@/lib/auth'

// Admin-only, idempotent backfill. For every legacy email index whose key is
// not already lowercase, add a normalized alias (user:email:<lowercase> -> id)
// and lowercase the stored user.email field, so mixed-case accounts created
// before email normalization resolve under either casing. The original index
// key is LEFT in place (harmless) so nothing breaks mid-flight.
//
// GET = dry run (report what would change). POST = apply.

async function plan() {
  const keys = await kv.keys('user:email:*')
  const changes: Array<{ key: string; email: string; normalized: string; userId: string }> = []
  for (const key of keys) {
    const email = key.slice('user:email:'.length)
    const normalized = normalizeEmail(email)
    if (normalized === email) continue // already canonical
    const userId = await kv.get<string>(key)
    if (!userId) continue
    changes.push({ key, email, normalized, userId })
  }
  return changes
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const changes = await plan()
  return NextResponse.json({ dryRun: true, count: changes.length, changes })
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const changes = await plan()
  let applied = 0
  const skipped: Array<{ normalized: string; reason: string }> = []

  for (const c of changes) {
    // Don't clobber a normalized index that already points at a different user.
    const existing = await kv.get<string>(`user:email:${c.normalized}`)
    if (existing && existing !== c.userId) {
      skipped.push({ normalized: c.normalized, reason: `taken by ${existing}` })
      continue
    }
    await kv.set(`user:email:${c.normalized}`, c.userId)
    await kv.hset(`user:${c.userId}`, { email: c.normalized })
    applied++
  }

  return NextResponse.json({ applied, skipped, totalCandidates: changes.length })
}
