import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getCurrentUser } from '@/lib/auth'
import { TenantSmsSender } from '@/lib/settings'
import { PLATFORM_SHARED_USER_ID } from '@/lib/provisioning'

// Admin-only: every Twilio number request across all tenants (plus the shared
// platform number) with its provisioning + verification status, in one list.

const STATUS_ORDER: Record<string, number> = {
  pending_verification: 0,
  provisioning: 1,
  failed: 2,
  active: 3,
  none: 4,
}

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  if (!currentUser || !currentUser.is_admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keys = await kv.keys('user:*:sms_sender')

    const rows = await Promise.all(
      keys.map(async (key) => {
        const userId = key.slice('user:'.length, key.length - ':sms_sender'.length)
        const sender = await kv.get<TenantSmsSender>(key)
        if (!sender) return null

        let username: string | undefined
        let email: string | undefined
        const isShared = userId === PLATFORM_SHARED_USER_ID
        if (isShared) {
          username = 'Platform shared number'
        } else {
          const u = await kv
            .hgetall<Record<string, any>>(`user:${userId}`)
            .catch(() => null)
          username = u?.username
          email = u?.email
        }

        return { userId, username, email, isShared, sender }
      })
    )

    const senders = rows
      .filter((r): r is NonNullable<typeof r> => !!r)
      .sort((a, b) => {
        if (a.isShared !== b.isShared) return a.isShared ? -1 : 1
        const sa = STATUS_ORDER[a.sender.status] ?? 9
        const sb = STATUS_ORDER[b.sender.status] ?? 9
        if (sa !== sb) return sa - sb
        return (b.sender.updatedAt || '').localeCompare(a.sender.updatedAt || '')
      })

    return NextResponse.json({ senders })
  } catch (error) {
    console.error('sms-senders list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
