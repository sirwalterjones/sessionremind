'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import CsvImport from '@/components/CsvImport'
import { useToast, useConfirm } from '@/components/Notifications'
import { TextingNumberCard } from '@/components/SetupStatus'
import { buildConnectorBookmarklet } from '@/lib/bookmarklet'
import {
  ArrowPathIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

interface UseSessionStatus {
  connected: boolean
  connectedAt?: string
  lastSyncAt?: string
  lastSyncStatus?: 'ok' | 'error'
  lastSyncError?: string
  lastSyncBookings?: number
  businessName?: string
}

interface Settings {
  studioName: string
  reminderTemplate: string
  registrationTemplate: string
  offsetsDays: number[]
  sendHourEastern: number
  autoSchedule: boolean
  emailReminders?: boolean
  usesession: UseSessionStatus
}

interface ScheduledMessage {
  id: string
  clientName: string
  phone: string
  sessionTitle: string
  sessionTime: string
  message: string
  scheduledFor: string
  reminderType: string
  status: string
  source?: string
}

export default function ConnectPage() {
  const { user, loading: authLoading } = useAuth()
  const toast = useToast()
  const confirmDialog = useConfirm()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [status, setStatus] = useState<UseSessionStatus>({ connected: false })
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([])

  // Connect flow
  const [pairCode, setPairCode] = useState('')
  const [bookmarklet, setBookmarklet] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    // Wait for the auth check to settle before deciding — redirecting on the
    // initial user=null state bounced direct loads of /connect to /login
    // (which middleware then forwards to /dashboard for signed-in visitors).
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const loadAll = useCallback(async () => {
    try {
      const [sRes, statusRes, schedRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/usesession/sync'),
        fetch('/api/schedule-reminders'),
      ])
      if (sRes.ok) {
        const data = await sRes.json()
        setSettings(data.settings)
      }
      if (statusRes.ok) {
        const data = await statusRes.json()
        setStatus(data.usesession || { connected: false })
      }
      if (schedRes.ok) {
        const data = await schedRes.json()
        setScheduled(data.scheduledMessages || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const flash = (type: 'ok' | 'err', text: string) => {
    if (type === 'ok') toast.success(text)
    else toast.error(text)
  }

  // --- Connect: generate pairing code + bookmarklet ---
  const startConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/usesession/pair', { method: 'POST' })
      if (!res.ok) throw new Error('Could not start connect')
      const { code } = await res.json()
      setPairCode(code)
      // Self-contained bookmarklet — see lib/bookmarklet.ts (shared with the
      // /welcome wizard): injects a small branded SessionRemind modal into the
      // UseSession page and reports the token back to /api/usesession/connect-token.
      setBookmarklet(buildConnectorBookmarklet(window.location.origin, code))
      pollForConnection()
    } catch (e) {
      flash('err', 'Could not start the connect process. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  // Poll until the bookmarklet reports back and the account is connected.
  const pollForConnection = () => {
    let tries = 0
    const interval = setInterval(async () => {
      tries++
      const res = await fetch('/api/usesession/sync')
      if (res.ok) {
        const data = await res.json()
        if (data.usesession?.connected) {
          clearInterval(interval)
          setStatus(data.usesession)
          setPairCode('')
          setBookmarklet('')
          flash('ok', `Connected${data.usesession.businessName ? ' to ' + data.usesession.businessName : ''}! Your reminders are syncing.`)
          loadAll()
        }
      }
      if (tries > 150) clearInterval(interval) // ~5 min
    }, 2000)
  }

  const syncNow = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/usesession/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        flash('ok', `Synced ${data.bookings} upcoming booking(s), scheduled ${data.scheduled} new reminder(s).`)
      } else {
        flash('err', data.error || 'Sync failed.')
      }
      loadAll()
    } finally {
      setSyncing(false)
    }
  }

  const disconnect = async () => {
    const ok = await confirmDialog({
      title: 'Disconnect UseSession?',
      message: 'Already-scheduled reminders are kept, but no new bookings will sync until you reconnect.',
      confirmLabel: 'Disconnect',
      tone: 'danger',
    })
    if (!ok) return
    await fetch('/api/usesession/disconnect', { method: 'POST' })
    flash('ok', 'Disconnected from UseSession.')
    loadAll()
  }

  // Auto-save a single changed field (no Save button). Toggles save on click;
  // text fields save on blur.
  const autoSave = async (patch: Partial<Settings>) => {
    setSaveState('saving')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save settings.')
      setSettings(data.settings)
      setSaveState('saved')
      setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 1500)
    } catch (e: any) {
      setSaveState('idle')
      toast.error(e?.message || 'Could not save settings.')
    }
  }

  const cancelReminder = async (id: string) => {
    await fetch(`/api/scheduled/${id}`, { method: 'DELETE' })
    setScheduled((prev) => prev.filter((m) => m.id !== id))
  }

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarklet)
    flash('ok', 'Connect link copied. Create a bookmark and paste it as the URL.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <ArrowPathIcon className="w-7 h-7 text-muted animate-spin" />
      </div>
    )
  }

  const upcoming = scheduled
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())

  return (
    <div className="text-ink">
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink transition-colors mb-10"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to dashboard
      </button>

      <div className="border-b border-hairline pb-6 mb-8">
        <p className="eyebrow mb-3">Connect</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
          Automatic reminders
        </h1>
        <p className="mt-3 text-muted max-w-xl leading-relaxed">
          Connect UseSession once and we&apos;ll automatically text your clients reminders before every session.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* ───────── Left column: number status + connect + settings + import ───────── */}
      <div className="min-w-0 space-y-5">

      {/* Your texting number — live status (number, verification state, and the
          "texts keep sending while you wait" reassurance) */}
      <TextingNumberCard />

      {/* Connection card */}
      <div className="rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
        {status.connected ? (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-display font-semibold text-ink">
                    Connected{status.businessName ? ` · ${status.businessName}` : ''}
                  </p>
                  <p className="text-sm text-muted mt-0.5">
                    {status.lastSyncAt
                      ? `Last synced ${new Date(status.lastSyncAt).toLocaleString()}`
                      : 'Waiting for first sync…'}
                    {typeof status.lastSyncBookings === 'number' && ` · ${status.lastSyncBookings} upcoming booking(s)`}
                  </p>
                  <p className="text-xs text-muted mt-1.5 max-w-md">
                    Syncs automatically every few minutes — new bookings, reschedules, and cancellations are
                    handled for you. <span className="text-ink/70">&ldquo;Sync now&rdquo; is optional.</span> Manage
                    reminders from any device, including your phone.
                  </p>
                  {status.lastSyncStatus === 'error' && (
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">Last sync error: {status.lastSyncError}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={syncNow}
                  disabled={syncing}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-accent-ink font-semibold hover:shadow-glow transition-shadow disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  Sync now
                </button>
                <button
                  onClick={disconnect}
                  className="rounded-full border border-hairline px-5 py-2.5 text-ink font-medium hover:bg-ink/5 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="font-display text-xl font-semibold text-ink">Connect your UseSession account</h2>
            </div>
            <p className="text-sm text-muted mb-6">
              Connect once from a computer (any browser — Chrome, Safari, Firefox). After that it&apos;s fully
              automatic: bookings sync on their own, and you can log in from your phone to manage reminders anytime.
            </p>

            {!pairCode ? (
              <div>
                <button
                  onClick={startConnect}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-accent-ink font-semibold hover:shadow-glow transition-shadow disabled:opacity-50"
                >
                  {connecting ? 'Starting…' : 'Connect UseSession'}
                </button>
                <p className="text-xs text-muted mt-3 max-w-md">
                  One button to drag, one click on UseSession — about a minute. We grab what we need automatically;
                  you never have to find or copy anything.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-hairline bg-card p-5">
                <p className="font-display text-sm font-semibold text-ink mb-4">Almost there — two steps:</p>
                <ol className="text-sm text-ink/80 space-y-4 list-decimal list-inside">
                  <li>
                    Drag this button to your bookmarks bar (or{' '}
                    <button onClick={copyBookmarklet} className="text-accent underline inline-flex items-center gap-0.5">
                      <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                      copy the link
                    </button>
                    ):
                    {/*
                      Rendered as raw HTML so the javascript: href survives (React
                      strips javascript: URLs). onClickCapture stops it from running
                      on this page if clicked — it's meant to be dragged, not clicked.
                    */}
                    <div
                      className="mt-3"
                      onClickCapture={(e) => e.preventDefault()}
                      dangerouslySetInnerHTML={{
                        __html:
                          '<a href="' +
                          bookmarklet.replace(/&/g, '&amp;').replace(/"/g, '&quot;') +
                          '" draggable="true" title="Drag me to your bookmarks bar" ' +
                          'style="background:rgb(var(--c-accent));color:rgb(var(--c-accent-ink))" ' +
                          'class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold cursor-grab no-underline">' +
                          'Connect to SessionRemind</a>',
                      }}
                    />
                    <p className="text-xs text-muted mt-2">
                      Can&apos;t drag it?{' '}
                      <button onClick={copyBookmarklet} className="text-accent underline">
                        Copy the link
                      </button>
                      , then make a new bookmark and paste it as the URL.
                    </p>
                  </li>
                  <li>
                    Open{' '}
                    <a href="https://app.usesession.com/sessions" target="_blank" rel="noreferrer" className="text-accent underline">
                      UseSession
                    </a>{' '}
                    (logged in) and click that bookmark once. We&apos;ll detect it here automatically.
                    <div className="mt-2 rounded-lg border border-hairline bg-panel/60 px-3 py-2 text-xs text-ink/80">
                      <strong className="text-ink font-medium">Clicked it from the wrong tab?</strong> No problem — the
                      bookmark opens UseSession for you in a new tab. Sign in there if you need to, then click it
                      once more from that tab.
                    </div>
                  </li>
                </ol>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted mt-4">Waiting for you to click it · code expires in 10 minutes</p>
              </div>
            )}

            {/* Trust copy */}
            <div className="mt-6 flex items-start gap-2.5 text-xs text-muted bg-card border border-hairline rounded-lg p-4">
              <ShieldCheckIcon className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">
                Your UseSession access is <strong className="text-ink font-medium">AES-256 encrypted</strong> and used only to read <em>your</em>{' '}
                upcoming bookings so reminders can send. We never store, mine, share, or sell your client data, and
                you can disconnect anytime.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      {settings && (
        <div className="rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink mb-6">Reminder settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Studio name</label>
              <input
                value={settings.studioName}
                onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                onBlur={() => autoSave({ studioName: settings.studioName })}
                className="w-full rounded-lg border border-hairline bg-card text-ink placeholder:text-faint px-3.5 py-2.5 text-[15px] focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Reminder message template
              </label>
              <textarea
                value={settings.reminderTemplate}
                onChange={(e) => setSettings({ ...settings, reminderTemplate: e.target.value })}
                onBlur={() => autoSave({ reminderTemplate: settings.reminderTemplate })}
                className="w-full rounded-lg border border-hairline bg-card text-ink placeholder:text-faint px-3.5 py-2.5 text-[15px] h-24 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
              <p className="font-mono text-xs text-muted mt-1.5">
                Placeholders: {'{name}'} {'{sessionTitle}'} {'{sessionTime}'} {'{studioName}'}
              </p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Send reminders</label>
                <div className="flex gap-2">
                  {[7, 3, 2, 1].map((d) => {
                    const on = settings.offsetsDays.includes(d)
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          const next = on
                            ? settings.offsetsDays.filter((x) => x !== d)
                            : [...settings.offsetsDays, d].sort((a, b) => b - a)
                          setSettings({ ...settings, offsetsDays: next })
                          autoSave({ offsetsDays: next })
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          on ? 'bg-accent text-accent-ink border-accent' : 'bg-card text-muted border-hairline hover:bg-ink/5'
                        }`}
                      >
                        {d}-day
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Auto-schedule new bookings</label>
                <button
                  onClick={() => {
                    const v = !settings.autoSchedule
                    setSettings({ ...settings, autoSchedule: v })
                    autoSave({ autoSchedule: v })
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    settings.autoSchedule
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-hairline text-muted'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${settings.autoSchedule ? 'bg-emerald-500' : 'bg-muted'}`} />
                  {settings.autoSchedule ? 'On' : 'Off'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Email reminders (alongside SMS)</label>
                <button
                  onClick={() => {
                    const v = !settings.emailReminders
                    setSettings({ ...settings, emailReminders: v })
                    autoSave({ emailReminders: v })
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    settings.emailReminders
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-hairline text-muted'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${settings.emailReminders ? 'bg-emerald-500' : 'bg-muted'}`} />
                  {settings.emailReminders ? 'On' : 'Off'}
                </button>
                <p className="text-xs text-muted mt-1.5">Also emails clients who have an email on file. Needs a verified sending domain.</p>
              </div>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted h-4" aria-live="polite">
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Changes save automatically'}
            </p>
          </div>
        </div>
      )}

      {/* CSV import (no-connection fallback) */}
      <div className="rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-1.5">Import from a CSV</h2>
        <p className="font-mono text-xs text-muted mb-5">Works without connecting — great on mobile, or as a backup.</p>
        <CsvImport onImported={loadAll} />
      </div>

      </div>

      {/* ───────── Right rail: upcoming queue ───────── */}
      <aside className="space-y-5 lg:sticky lg:top-8">

      {/* Upcoming auto-scheduled reminders */}
      <div className="rounded-2xl border border-hairline bg-panel p-5 sm:p-6">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">Upcoming reminders</h2>
          {upcoming.length > 0 && <span className="font-mono text-xs text-muted">{upcoming.length}</span>}
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">
            No reminders scheduled yet. Connect UseSession (or sync) and they&apos;ll appear here automatically.
          </p>
        ) : (
          <div className="divide-y divide-hairline max-h-[480px] overflow-y-auto pr-1">
            {upcoming.slice(0, 50).map((m) => (
              <div key={m.id} className="py-3.5 flex items-start justify-between gap-3 -mx-3 px-3 rounded-lg hover:bg-card transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {m.clientName} <span className="text-muted">· {m.sessionTitle}</span>
                  </p>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    {m.reminderType} reminder · sends {new Date(m.scheduledFor).toLocaleString()}
                    {m.source === 'usesession' && ' · auto'}
                  </p>
                </div>
                <button
                  onClick={() => cancelReminder(m.id)}
                  className="text-muted hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0"
                  title="Cancel this reminder"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        <LockClosedIcon className="w-3.5 h-3.5 flex-shrink-0" />
        Your UseSession token is encrypted at rest and never shared
      </div>

      </aside>
      </div>
    </div>
  )
}
