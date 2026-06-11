'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/Notifications'

interface TicketReply {
  message: string
  at: string
  adminName?: string
}

interface Ticket {
  id: string
  name: string
  email: string
  topic: string
  message: string
  status: 'open' | 'replied' | 'closed'
  createdAt: string
  updatedAt: string
  userId?: string
  username?: string
  replies: TicketReply[]
}

const TOPIC_LABELS: Record<string, string> = {
  support: 'Support',
  billing: 'Billing',
  bug: 'Bug',
  general: 'General',
}

const STATUS_DOT: Record<string, string> = {
  open: 'rgb(var(--c-accent))',
  replied: '#f59e0b',
  closed: '#10b981',
}

function fmt(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminSupportPage() {
  const { user, loading } = useAuth()
  const toast = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('open')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/admin/support')
      if (res.ok) setTickets((await res.json()).tickets || [])
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (user?.is_admin) load()
  }, [user, load])

  const rows = useMemo(
    () => (filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter]
  )
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length, open: 0, replied: 0, closed: 0 }
    tickets.forEach((t) => c[t.status]++)
    return c
  }, [tickets])

  const sendReply = async (t: Ticket) => {
    if (!reply.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/support/${t.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reply failed')
      setTickets((list) => list.map((x) => (x.id === t.id ? data.ticket : x)))
      setReply('')
      toast.success(`Reply emailed to ${t.email}.`)
    } catch (e: any) {
      toast.error(e?.message || 'Could not send the reply.')
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (t: Ticket, status: Ticket['status']) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/support/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setTickets((list) => list.map((x) => (x.id === t.id ? data.ticket : x)))
      toast.success(status === 'closed' ? 'Ticket closed.' : 'Ticket reopened.')
    } catch (e: any) {
      toast.error(e?.message || 'Could not update the ticket.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-hairline border-t-ink" />
      </div>
    )
  }
  if (!user?.is_admin) {
    return (
      <div className="py-20 text-center text-sm text-muted">
        Admins only.{' '}
        <Link href="/dashboard" className="text-accent underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="text-ink">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Admin</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.0]">Support inbox</h1>
          <p className="mt-2 text-sm text-muted">
            Replies are emailed to the requester from SessionRemind and recorded here.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
        >
          ← Admin console
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(['open', 'replied', 'closed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-hairline text-muted hover:bg-ink/5'
            }`}
          >
            {f} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {fetching && <p className="text-sm text-muted">Loading…</p>}
        {!fetching && rows.length === 0 && (
          <p className="rounded-xl border border-hairline bg-panel px-4 py-10 text-center text-sm text-muted">
            No {filter === 'all' ? '' : filter} tickets. 🎉
          </p>
        )}
        {rows.map((t) => {
          const open = expanded === t.id
          return (
            <div key={t.id} className="overflow-hidden rounded-xl border border-hairline">
              <button
                onClick={() => {
                  setExpanded(open ? null : t.id)
                  setReply('')
                }}
                className="flex w-full flex-wrap items-center justify-between gap-3 bg-card px-4 py-3.5 text-left transition-colors hover:bg-ink/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: STATUS_DOT[t.status] }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                        {TOPIC_LABELS[t.topic] || t.topic}
                      </span>
                      {t.username && (
                        <span className="rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                          {t.username}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-sm text-muted">{t.message}</div>
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-faint">{fmt(t.createdAt)}</span>
              </button>

              {open && (
                <div className="space-y-4 border-t border-hairline bg-panel px-4 py-4">
                  <div>
                    <div className="mb-1 text-xs text-faint">
                      From {t.name} &lt;{t.email}&gt; · {fmt(t.createdAt)}
                    </div>
                    <p className="whitespace-pre-line rounded-lg border border-hairline bg-card px-3.5 py-3 text-sm">
                      {t.message}
                    </p>
                  </div>

                  {t.replies.map((r, i) => (
                    <div key={i}>
                      <div className="mb-1 text-xs text-faint">
                        Reply{r.adminName ? ` from ${r.adminName}` : ''} · {fmt(r.at)}
                      </div>
                      <p className="whitespace-pre-line rounded-lg border border-emerald-400/20 bg-card px-3.5 py-3 text-sm">
                        {r.message}
                      </p>
                    </div>
                  ))}

                  {t.status !== 'closed' && (
                    <div>
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={`Reply to ${t.name} — this is emailed to ${t.email}`}
                        className="min-h-[110px] w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {t.status !== 'closed' && (
                      <button
                        onClick={() => sendReply(t)}
                        disabled={busy || !reply.trim()}
                        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? 'Sending…' : 'Send reply'}
                      </button>
                    )}
                    {t.status !== 'closed' ? (
                      <button
                        onClick={() => setStatus(t, 'closed')}
                        disabled={busy}
                        className="rounded-full border border-hairline px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5 disabled:opacity-50"
                      >
                        Close ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => setStatus(t, 'open')}
                        disabled={busy}
                        className="rounded-full border border-hairline px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5 disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                    <a
                      href={`mailto:${t.email}`}
                      className="ml-auto text-xs text-faint underline-offset-2 hover:underline"
                    >
                      {t.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
