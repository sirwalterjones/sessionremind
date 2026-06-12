'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useToast, useConfirm } from '@/components/Notifications'

interface AdminUser {
  id: string
  username?: string
  email?: string
  created_at?: string
  sms_usage?: number
  is_admin?: boolean
  payment_override?: boolean
  stripe_customer_id?: string | null
  subscription_status?: string
}

function daysSince(iso?: string): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.floor((Date.now() - t) / 86400000)
}

export default function SpamCleanupPage() {
  const { user, loading } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [fetching, setFetching] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Filters
  const [withinDays, setWithinDays] = useState<number>(0) // 0 = any age
  const [zeroSms, setZeroSms] = useState(true)
  const [neverPaid, setNeverPaid] = useState(true)
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

  // Candidate spam accounts: never admins, never yourself.
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users
      .filter((u) => !u.is_admin && u.id !== user?.id)
      .filter((u) => {
        if (zeroSms && (Number(u.sms_usage) || 0) > 0) return false
        if (neverPaid && u.stripe_customer_id) return false
        if (withinDays > 0) {
          const d = daysSince(u.created_at)
          if (d === null || d > withinDays) return false
        }
        if (q) {
          const hay = `${u.username || ''} ${u.email || ''} ${u.id}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => (daysSince(a.created_at) ?? 1e9) - (daysSince(b.created_at) ?? 1e9))
  }, [users, search, zeroSms, neverPaid, withinDays, user])

  const candidateIds = useMemo(() => candidates.map((c) => c.id), [candidates])
  const allSelected = candidateIds.length > 0 && candidateIds.every((id) => selected.has(id))

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((s) => {
      if (allSelected) return new Set(Array.from(s).filter((id) => !candidateIds.includes(id)))
      const merged = Array.from(s)
      candidateIds.forEach((id) => merged.push(id))
      return new Set(merged)
    })

  const selectedCount = useMemo(
    () => candidateIds.filter((id) => selected.has(id)).length,
    [candidateIds, selected]
  )

  const doDelete = async () => {
    const ids = candidateIds.filter((id) => selected.has(id))
    if (!ids.length) return
    const ok = await confirm({
      title: `Delete ${ids.length} account${ids.length === 1 ? '' : 's'}?`,
      message:
        'This permanently removes the selected accounts, their sessions, scheduled reminders, and cancels any Stripe subscription. This cannot be undone.',
      confirmLabel: `Delete ${ids.length}`,
      tone: 'danger',
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userIds: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      const extra = data.skippedAdmins ? ` · ${data.skippedAdmins} admin(s) skipped` : ''
      const failed = data.failed ? ` · ${data.failed} failed` : ''
      toast.success(`Deleted ${data.deleted} account${data.deleted === 1 ? '' : 's'}${extra}${failed}`, 'Spam cleared')
      setSelected(new Set())
      await load()
    } catch (e: any) {
      toast.error(`Bulk delete failed: ${e?.message || e}`)
    } finally {
      setDeleting(false)
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
      <h1 className="font-display text-3xl font-semibold text-ink">Spam cleanup</h1>
      <p className="mt-1.5 text-sm text-muted">
        Find and bulk-delete junk accounts. Admins and your own account are always excluded.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-hairline bg-panel p-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={zeroSms} onChange={(e) => setZeroSms(e.target.checked)} />
          0 SMS sent
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={neverPaid} onChange={(e) => setNeverPaid(e.target.checked)} />
          Never paid (no Stripe)
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          Created within
          <input
            type="number"
            min={0}
            value={withinDays}
            onChange={(e) => setWithinDays(Math.max(0, Number(e.target.value) || 0))}
            className="w-16 rounded-md border border-hairline bg-card px-2 py-1 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
          days <span className="text-muted">(0 = any)</span>
        </label>
        <input
          type="text"
          placeholder="Search email / username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
      </div>

      {/* Action bar */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {fetching ? 'Loading…' : `${candidates.length} match · ${selectedCount} selected · ${users.length} total`}
        </p>
        <button
          onClick={doDelete}
          disabled={deleting || selectedCount === 0}
          className="rounded-full border border-red-400/30 bg-red-500/15 px-5 py-2 text-sm font-medium text-red-700 dark:text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40"
        >
          {deleting ? 'Deleting…' : `Delete selected (${selectedCount})`}
        </button>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-xl border border-hairline">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left font-mono text-[12px] uppercase tracking-[0.14em] text-faint">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th className="px-3 py-2.5">Email / Username</th>
              <th className="px-3 py-2.5">Created</th>
              <th className="px-3 py-2.5">SMS</th>
              <th className="px-3 py-2.5">Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {candidates.map((u) => {
              const d = daysSince(u.created_at)
              return (
                <tr key={u.id} className={selected.has(u.id) ? 'bg-accent/10' : 'hover:bg-card'}>
                  <td className="px-3 py-2.5">
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-ink">{u.email || '(no email)'}</div>
                    <div className="text-xs text-muted">{u.username || u.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted">
                    {d === null ? '—' : d === 0 ? 'today' : `${d}d ago`}
                  </td>
                  <td className="px-3 py-2.5 text-muted">{Number(u.sms_usage) || 0}</td>
                  <td className="px-3 py-2.5">
                    {u.stripe_customer_id ? (
                      <span className="text-emerald-700 dark:text-emerald-300">yes</span>
                    ) : (
                      <span className="text-muted">no</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {!fetching && candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted">
                  No accounts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
