'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/Notifications'

interface SenderRow {
  userId: string
  username?: string
  email?: string
  isShared: boolean
  sender: {
    status: string
    phoneNumber?: string
    phoneNumberSid?: string
    messagingServiceSid?: string
    verificationSid?: string
    verificationStatus?: string
    rejectionReason?: string
    error?: string
    updatedAt?: string
  }
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  active: { color: '#16a34a', label: 'Active' },
  pending_verification: { color: '#d97706', label: 'Pending verification' },
  provisioning: { color: '#2563eb', label: 'Provisioning' },
  failed: { color: '#dc2626', label: 'Failed' },
  none: { color: '#8A857C', label: 'None' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { color: '#8A857C', label: status }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm">
      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

function prettyDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

export default function NumbersPage() {
  const { user, loading } = useAuth()
  const toast = useToast()

  const [rows, setRows] = useState<SenderRow[]>([])
  const [fetching, setFetching] = useState(true)
  const [busy, setBusy] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/admin/sms-senders', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRows(Array.isArray(data.senders) ? data.senders : [])
    } catch (e: any) {
      toast.error(`Could not load numbers: ${e?.message || e}`)
    } finally {
      setFetching(false)
    }
  }, [toast])

  useEffect(() => {
    if (user?.is_admin) load()
  }, [user, load])

  const refreshOne = async (userId: string) => {
    setBusy((b) => new Set(b).add(userId))
    try {
      const res = await fetch('/api/admin/provision-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action: 'refresh' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      toast.success(
        `Status: ${data.sender?.status || 'unknown'} (${data.sender?.verificationStatus || '—'})`,
        'Refreshed from Twilio'
      )
      await load()
    } catch (e: any) {
      toast.error(`Refresh failed: ${e?.message || e}`)
    } finally {
      setBusy((b) => {
        const n = new Set(b)
        n.delete(userId)
        return n
      })
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
    <div className="max-w-6xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted">
        <Link href="/admin" className="hover:text-ink transition-colors">
          ← Admin
        </Link>
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink">Twilio numbers</h1>
      <p className="mt-1.5 text-sm text-muted">
        Every toll-free number request across all tenants — including the platform shared number —
        with its live provisioning and carrier-verification status. Pending verifications are also
        polled automatically by the 5-minute cron.
      </p>

      <p className="mt-6 text-sm text-muted">
        {fetching ? 'Loading…' : `${rows.length} number request${rows.length === 1 ? '' : 's'}`}
      </p>

      <div className="mt-2 overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#FAFAF8] text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-3 py-2.5">Tenant</th>
              <th className="px-3 py-2.5">Number</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Verification</th>
              <th className="px-3 py-2.5">Updated</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((r) => (
              <tr key={r.userId} className="bg-white align-top">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-ink">
                    {r.isShared ? (
                      <span className="inline-flex items-center gap-1.5">
                        {r.username}
                        <span className="rounded-full bg-[#FAFAF8] border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                          Platform
                        </span>
                      </span>
                    ) : (
                      r.username || '(unknown)'
                    )}
                  </div>
                  <div className="text-xs text-muted">{r.email || (r.isShared ? 'Fallback for studios without their own number' : r.userId)}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap font-medium text-ink">
                  {r.sender.phoneNumber || '—'}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={r.sender.status} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink">
                    {r.sender.verificationStatus || '—'}
                  </div>
                  {r.sender.rejectionReason && (
                    <div className="mt-1 max-w-[260px] text-xs text-[#dc2626]">{r.sender.rejectionReason}</div>
                  )}
                  {r.sender.error && (
                    <div className="mt-1 max-w-[260px] text-xs text-muted">{r.sender.error}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted">
                  {prettyDate(r.sender.updatedAt)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {r.sender.verificationSid && (
                    <button
                      onClick={() => refreshOne(r.userId)}
                      disabled={busy.has(r.userId)}
                      className="whitespace-nowrap rounded-full border border-hairline px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-[#FAFAF8] disabled:opacity-40"
                    >
                      {busy.has(r.userId) ? 'Checking…' : 'Refresh from Twilio'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!fetching && rows.length === 0 && (
              <tr className="bg-white">
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                  No number requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
