'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useToast, useConfirm } from '@/components/Notifications'

interface Reminder {
  id: string
  clientName?: string
  phone?: string
  email?: string
  sessionTitle?: string
  sessionTime?: string
  message: string
  scheduledFor: string
  sessionDate?: string
  reminderType?: string
  status: 'scheduled' | 'sent' | 'failed'
  sentAt?: string
  source?: string
}

type StatusFilter = 'scheduled' | 'sent' | 'failed' | 'all'

function fmt(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
function toLocalInput(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromLocalInput(v: string) {
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d.toISOString()
}
function dateKey(iso?: string) {
  if (!iso) return 'nodate'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? 'nodate' : d.toISOString().slice(0, 10)
}
function sessionDateLabel(iso?: string) {
  if (!iso) return 'Date TBD'
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? 'Date TBD'
    : d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function RemindersPage() {
  const { user, loading } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()

  const [items, setItems] = useState<Reminder[]>([])
  const [fetching, setFetching] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('scheduled')
  const [search, setSearch] = useState('')

  const [editing, setEditing] = useState<Reminder | null>(null)
  const [editMsg, setEditMsg] = useState('')
  const [editWhen, setEditWhen] = useState('')
  const [saving, setSaving] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggleGroup = (k: string) =>
    setCollapsed((s) => {
      const n = new Set(s)
      n.has(k) ? n.delete(k) : n.add(k)
      return n
    })

  const load = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/schedule-reminders', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(Array.isArray(data.scheduledMessages) ? data.scheduledMessages : [])
    } catch (e: any) {
      toast.error(`Could not load reminders: ${e?.message || e}`)
    } finally {
      setFetching(false)
    }
  }, [toast])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  const counts = useMemo(
    () => ({
      scheduled: items.filter((i) => i.status === 'scheduled').length,
      sent: items.filter((i) => i.status === 'sent').length,
      failed: items.filter((i) => i.status === 'failed').length,
    }),
    [items]
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .filter((r) => !q || `${r.clientName || ''} ${r.sessionTitle || ''} ${r.phone || ''}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
  }, [items, statusFilter, search])

  // Group reminders into a folder per session (session title + date).
  const groups = useMemo(() => {
    const m = new Map<string, { key: string; title: string; date?: string; items: Reminder[] }>()
    for (const r of rows) {
      const d = r.sessionDate || r.scheduledFor
      const key = `${r.sessionTitle || 'Session'}__${dateKey(d)}`
      if (!m.has(key)) m.set(key, { key, title: r.sessionTitle || 'Session', date: d, items: [] })
      m.get(key)!.items.push(r)
    }
    const arr = Array.from(m.values())
    arr.forEach((g) =>
      g.items.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    )
    arr.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
    return arr
  }, [rows])

  const openEdit = (r: Reminder) => {
    setEditing(r)
    setEditMsg(r.message)
    setEditWhen(toLocalInput(r.scheduledFor))
  }

  const saveEdit = async () => {
    if (!editing) return
    const iso = fromLocalInput(editWhen)
    if (!iso) {
      toast.error('Please enter a valid date and time.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/scheduled/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: editMsg, scheduledFor: iso }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setItems((us) => us.map((x) => (x.id === editing.id ? { ...x, message: editMsg, scheduledFor: iso } : x)))
      toast.success('Reminder updated.')
      setEditing(null)
    } catch (e: any) {
      toast.error(`Update failed: ${e?.message || e}`)
    } finally {
      setSaving(false)
    }
  }

  const cancel = async (r: Reminder) => {
    const ok = await confirm({
      title: 'Cancel this reminder?',
      message: `This permanently removes the ${r.reminderType || ''} reminder for ${
        r.clientName || 'this client'
      } — it won't be sent.`,
      confirmLabel: 'Cancel reminder',
      tone: 'danger',
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/scheduled/${r.id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setItems((us) => us.filter((x) => x.id !== r.id))
      toast.success('Reminder cancelled.')
    } catch (e: any) {
      toast.error(`Cancel failed: ${e?.message || e}`)
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>
  if (!user) return <p className="text-sm text-muted">Please log in.</p>

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'scheduled', label: `Scheduled (${counts.scheduled})` },
    { key: 'sent', label: `Sent (${counts.sent})` },
    { key: 'failed', label: `Failed (${counts.failed})` },
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-muted">
        <Link href="/dashboard" className="hover:text-ink transition-colors">
          ← Dashboard
        </Link>
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink">Reminders</h1>
      <p className="mt-1.5 text-sm text-muted">Reschedule, edit the message, or cancel any upcoming reminder.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === t.key ? 'bg-accent text-accent-ink' : 'border border-hairline text-ink hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search client / session…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto min-w-[180px] flex-1 rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 sm:flex-none"
        />
      </div>

      <div className="mt-4 space-y-3">
        {fetching && <p className="text-sm text-muted">Loading…</p>}
        {!fetching && groups.length === 0 && (
          <p className="rounded-xl border border-hairline bg-panel px-4 py-8 text-center text-sm text-muted">
            No {statusFilter === 'all' ? '' : statusFilter} reminders.
          </p>
        )}
        {groups.map((g) => {
          const open = !collapsed.has(g.key)
          return (
            <div key={g.key} className="overflow-hidden rounded-xl border border-hairline">
              <button
                onClick={() => toggleGroup(g.key)}
                className="flex w-full items-center justify-between gap-3 bg-panel px-4 py-3 text-left transition-colors hover:bg-card"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">{g.title}</div>
                  <div className="text-xs text-muted">
                    {sessionDateLabel(g.date)} · {g.items.length} reminder{g.items.length === 1 ? '' : 's'}
                  </div>
                </div>
                <span className="flex-shrink-0 text-muted">{open ? '▾' : '▸'}</span>
              </button>
              {open && (
                <div className="divide-y divide-hairline">
                  {g.items.map((r) => {
                    const isScheduled = r.status === 'scheduled'
                    const dot = r.status === 'sent' ? '#34d399' : r.status === 'failed' ? '#f87171' : '#C6F24E'
                    return (
                      <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 bg-card px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: dot }} />
                            <span className="font-medium text-ink">{r.clientName || '(no name)'}</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                              {r.reminderType}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-muted">
                            {r.status === 'sent' ? `Sent ${fmt(r.sentAt || r.scheduledFor)}` : `Sends ${fmt(r.scheduledFor)}`}
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs text-muted">{r.message}</div>
                        </div>
                        {isScheduled && (
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-white/5"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => cancel(r)}
                              className="rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/25"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          className="sr-fade-in fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="sr-pop-in relative w-full max-w-md rounded-2xl border border-hairline bg-card p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display mb-1 text-lg font-semibold text-ink">Edit reminder</h2>
            <p className="text-xs text-muted">
              {editing.clientName} · {editing.sessionTitle}
            </p>

            <label className="mt-4 mb-1.5 block text-sm font-medium text-ink">Send at</label>
            <input
              type="datetime-local"
              value={editWhen}
              onChange={(e) => setEditWhen(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />

            <label className="mt-4 mb-1.5 block text-sm font-medium text-ink">Message</label>
            <textarea
              value={editMsg}
              onChange={(e) => setEditMsg(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-shadow hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)] disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
