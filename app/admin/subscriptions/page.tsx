'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/Notifications'

interface AdminUser {
  id: string
  username?: string
  email?: string
  is_admin?: boolean
  payment_override?: boolean
  stripe_customer_id?: string | null
  subscription_status?: string
}

interface Live {
  stripeStatus: string | null
  after: string | null
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || 'unknown').toLowerCase()
  const color =
    s === 'active'
      ? '#34D399'
      : s === 'past_due'
      ? '#FBBF24'
      : s === 'canceled' || s === 'cancelled' || s === 'inactive'
      ? '#F87171'
      : '#6E736C'
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {status || '—'}
    </span>
  )
}

export default function SubscriptionsPage() {
  const { user, loading } = useAuth()
  const toast = useToast()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [fetching, setFetching] = useState(true)
  const [live, setLive] = useState<Record<string, Live>>({})
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [resyncingAll, setResyncingAll] = useState(false)
  const [onlyStripe, setOnlyStripe] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (e: any) {
      toast.error(`Could not load users: ${e?.message || e}`)
    } finally {
      setFetching(false)
    }
  }, [toast])

  useEffect(() => {
    if (user?.is_admin) load()
  }, [user, load])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users
      .filter((u) => !u.is_admin)
      .filter((u) => (onlyStripe ? !!u.stripe_customer_id : true))
      .filter((u) => {
        if (!q) return true
        return `${u.username || ''} ${u.email || ''} ${u.id}`.toLowerCase().includes(q)
      })
  }, [users, onlyStripe, search])

  const resyncOne = async (userId: string) => {
    setBusy((b) => new Set(b).add(userId))
    try {
      const res = await fetch('/api/admin/subscriptions/resync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      const r = data.result
      setLive((m) => ({ ...m, [userId]: { stripeStatus: r.stripeStatus, after: r.after } }))
      setUsers((us) => us.map((u) => (u.id === userId ? { ...u, subscription_status: r.after ?? u.subscription_status } : u)))
      toast.success(
        r.changed ? `Updated: ${r.before ?? '—'} → ${r.after} (Stripe: ${r.stripeStatus})` : `In sync (${r.after ?? '—'})`,
      )
    } catch (e: any) {
      toast.error(`Resync failed: ${e?.message || e}`)
    } finally {
      setBusy((b) => {
        const n = new Set(b)
        n.delete(userId)
        return n
      })
    }
  }

  const resyncAll = async () => {
    setResyncingAll(true)
    try {
      const res = await fetch('/api/admin/subscriptions/resync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      const map: Record<string, Live> = {}
      for (const r of data.results || []) map[r.userId] = { stripeStatus: r.stripeStatus, after: r.after }
      setLive((m) => ({ ...m, ...map }))
      toast.success(`Resynced ${data.processed} · ${data.changed} updated`, 'Stripe resync')
      await load()
    } catch (e: any) {
      toast.error(`Resync all failed: ${e?.message || e}`)
    } finally {
      setResyncingAll(false)
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!user) return <p className="text-sm text-muted">Please log in.</p>
  if (!user.is_admin)
    return (
      <div className="py-10">
        <h1 className="font-display text-2xl font-semibold text-ink">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">This page is for admins only.</p>
      </div>
    )

  return (
    <div className="max-w-5xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted">
        <Link href="/admin" className="hover:text-ink transition-colors">
          ← Admin
        </Link>
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink">Subscriptions</h1>
      <p className="mt-1.5 text-sm text-muted">
        Compare each user&apos;s stored status against live Stripe, and resync when they&apos;ve drifted.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-hairline bg-panel p-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={onlyStripe} onChange={(e) => setOnlyStripe(e.target.checked)} />
          Only users with a Stripe customer
        </label>
        <input
          type="text"
          placeholder="Search email / username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
        <button
          onClick={resyncAll}
          disabled={resyncingAll}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {resyncingAll ? 'Resyncing…' : 'Resync all from Stripe'}
        </button>
      </div>

      <p className="mt-4 text-sm text-muted">{fetching ? 'Loading…' : `${rows.length} shown · ${users.length} total`}</p>

      <div className="mt-2 overflow-hidden rounded-xl border border-hairline">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            <tr>
              <th className="px-3 py-2.5">Email / Username</th>
              <th className="px-3 py-2.5">Stored status</th>
              <th className="px-3 py-2.5">Live Stripe</th>
              <th className="px-3 py-2.5">Stripe customer</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((u) => {
              const l = live[u.id]
              return (
                <tr key={u.id} className="hover:bg-card">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-ink">{u.email || '(no email)'}</div>
                    <div className="text-xs text-muted">{u.username || u.id}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={u.subscription_status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted">{l ? l.stripeStatus || 'none' : '—'}</td>
                  <td className="px-3 py-2.5">
                    {u.stripe_customer_id ? (
                      <span className="text-emerald-300">yes</span>
                    ) : (
                      <span className="text-muted">no</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => resyncOne(u.id)}
                      disabled={busy.has(u.id) || !u.stripe_customer_id}
                      className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-white/5 disabled:opacity-40"
                    >
                      {busy.has(u.id) ? 'Resyncing…' : 'Resync'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {!fetching && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted">
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
