import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { kv } from '@vercel/kv'

// Admin-only bulk delete — built for clearing spam accounts. Cascades every
// per-user key (hash, email index, password, settings, UseSession token),
// removes the user from the connected set, drops their sessions and scheduled
// messages (so no orphaned reminders fire), and best-effort cancels any Stripe
// subscription. Refuses to delete admins or the caller.

const STORAGE_KEY = 'scheduled-messages'
const CONNECTED_SET = 'usesession:connected'
const MAX_BATCH = 1000

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userIds: string[]
  try {
    const body = await request.json()
    userIds = Array.isArray(body?.userIds) ? Array.from(new Set(body.userIds.map(String))) : []
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Never delete the caller.
  userIds = userIds.filter((id) => id && id !== currentUser.id)
  if (!userIds.length) {
    return NextResponse.json({ error: 'No deletable user ids provided' }, { status: 400 })
  }
  if (userIds.length > MAX_BATCH) {
    return NextResponse.json({ error: `Too many at once (max ${MAX_BATCH})` }, { status: 400 })
  }

  const deletedSet = new Set<string>()
  let deleted = 0
  let skippedAdmins = 0
  const failures: string[] = []

  for (const id of userIds) {
    try {
      const user = await kv.hgetall<Record<string, any>>(`user:${id}`)
      if (!user) continue // already gone
      if (user.is_admin) {
        skippedAdmins++
        continue // safety: never bulk-delete an admin
      }

      // Best-effort: cancel any live Stripe subscription so we don't keep billing.
      if (user.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
        try {
          await stripe.subscriptions.cancel(String(user.stripe_subscription_id))
        } catch (e) {
          console.error(`bulk-delete: stripe cancel failed for ${id}:`, e)
        }
      }

      await kv.del(`user:${id}`)
      if (user.email) await kv.del(`user:email:${user.email}`)
      await kv.del(`user:${id}:password`)
      await kv.del(`user:${id}:settings`)
      await kv.del(`user:${id}:usesession_token`)
      await kv.srem(CONNECTED_SET, id)

      deletedSet.add(id)
      deleted++
    } catch (e) {
      console.error(`bulk-delete: failed for ${id}:`, e)
      failures.push(id)
    }
  }

  // Drop sessions for deleted users (single scan).
  if (deletedSet.size) {
    try {
      const sessionKeys = await kv.keys('session:*')
      for (const sk of sessionKeys) {
        const s = await kv.hgetall<Record<string, any>>(sk)
        if (s && deletedSet.has(String(s.user_id))) await kv.del(sk)
      }
    } catch (e) {
      console.error('bulk-delete: session cleanup failed:', e)
    }

    // Remove their scheduled messages so no orphaned reminders ever send.
    try {
      const msgs = await kv.get<any[]>(STORAGE_KEY)
      if (Array.isArray(msgs) && msgs.length) {
        const next = msgs.filter((m) => !deletedSet.has(String(m.userId)))
        if (next.length !== msgs.length) await kv.set(STORAGE_KEY, next)
      }
    } catch (e) {
      console.error('bulk-delete: message cleanup failed:', e)
    }
  }

  console.log(`ADMIN ${currentUser.username} bulk-deleted ${deleted} users`, { failures, skippedAdmins })

  return NextResponse.json({ deleted, skippedAdmins, failed: failures.length, failures })
}
