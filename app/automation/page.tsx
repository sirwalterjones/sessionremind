'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import CsvImport from '@/components/CsvImport'
import {
  BoltIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  LinkIcon,
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

export default function AutomationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [status, setStatus] = useState<UseSessionStatus>({ connected: false })
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([])
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Connect flow
  const [pairCode, setPairCode] = useState('')
  const [bookmarklet, setBookmarklet] = useState('')
  const [pasteToken, setPasteToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

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
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 6000)
  }

  // --- Connect: generate pairing code + bookmarklet ---
  const startConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/usesession/pair', { method: 'POST' })
      if (!res.ok) throw new Error('Could not start connect')
      const { code } = await res.json()
      setPairCode(code)
      const origin = window.location.origin
      const bm =
        `javascript:(function(){var t=localStorage.getItem('session-token');` +
        `if(!t){alert('Open UseSession and make sure you are logged in, then click Connect again.');return;}` +
        `fetch('${origin}/api/usesession/connect-token',{method:'POST',headers:{'content-type':'application/json'},` +
        `body:JSON.stringify({code:'${code}',token:t})}).then(function(r){return r.json()}).then(function(d){` +
        `alert(d.success?'\\u2705 Connected to SessionRemind!'+(d.sync&&typeof d.sync.scheduled==='number'?' Scheduled '+d.sync.scheduled+' reminders.':''):'\\u274c '+(d.error||'Failed'))})` +
        `.catch(function(e){alert('\\u274c '+e)})})();`
      setBookmarklet(bm)
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

  // --- Connect: paste-token fallback ---
  const connectWithToken = async () => {
    if (!pasteToken.trim()) return
    setConnecting(true)
    try {
      const res = await fetch('/api/usesession/connect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: pasteToken.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setPasteToken('')
      flash('ok', `Connected${data.businessName ? ' to ' + data.businessName : ''}!`)
      loadAll()
    } catch (e: any) {
      flash('err', e.message || 'Could not connect with that token.')
    } finally {
      setConnecting(false)
    }
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
    if (!confirm('Disconnect UseSession? Already-scheduled reminders are kept, but no new bookings will sync.')) return
    await fetch('/api/usesession/disconnect', { method: 'POST' })
    flash('ok', 'Disconnected from UseSession.')
    loadAll()
  }

  const saveSettings = async () => {
    if (!settings) return
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          studioName: settings.studioName,
          reminderTemplate: settings.reminderTemplate,
          offsetsDays: settings.offsetsDays,
          sendHourEastern: settings.sendHourEastern,
          autoSchedule: settings.autoSchedule,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSettings(data.settings)
        flash('ok', 'Settings saved.')
      } else {
        flash('err', data.error || 'Could not save settings.')
      }
    } finally {
      setSavingSettings(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  const upcoming = scheduled
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to dashboard
        </button>

        <div className="flex items-center mb-2">
          <BoltIcon className="w-7 h-7 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Automatic reminders</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Connect UseSession once and we&apos;ll automatically text your clients reminders before every session.
        </p>

        {notice && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              notice.type === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Connection card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {status.connected ? (
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Connected{status.businessName ? ` · ${status.businessName}` : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      {status.lastSyncAt
                        ? `Last synced ${new Date(status.lastSyncAt).toLocaleString()}`
                        : 'Waiting for first sync…'}
                      {typeof status.lastSyncBookings === 'number' && ` · ${status.lastSyncBookings} upcoming booking(s)`}
                    </p>
                    {status.lastSyncStatus === 'error' && (
                      <p className="text-sm text-red-600 mt-1">Last sync error: {status.lastSyncError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={syncNow}
                    disabled={syncing}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                    Sync now
                  </button>
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-1">
                <LinkIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="font-semibold text-gray-900">Connect your UseSession account</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                One-time setup. After this, new bookings sync automatically — you never have to touch it again.
              </p>

              {!pairCode ? (
                <button
                  onClick={startConnect}
                  disabled={connecting}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  <BoltIcon className="w-5 h-5 mr-2" />
                  {connecting ? 'Starting…' : 'Connect UseSession'}
                </button>
              ) : (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm font-medium text-gray-900 mb-3">Almost there — two steps:</p>
                  <ol className="text-sm text-gray-700 space-y-3 list-decimal list-inside">
                    <li>
                      Drag this button to your bookmarks bar (or{' '}
                      <button onClick={copyBookmarklet} className="text-blue-600 underline inline-flex items-center">
                        <ClipboardDocumentIcon className="w-3.5 h-3.5 mr-0.5" />
                        copy the link
                      </button>
                      ):
                      <div className="mt-2">
                        {/* React blocks javascript: hrefs, so set it via ref. */}
                        <a
                          ref={(el) => {
                            if (el && bookmarklet) el.setAttribute('href', bookmarklet)
                          }}
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-grab"
                        >
                          <BoltIcon className="w-4 h-4 mr-1" /> Connect to SessionRemind
                        </a>
                      </div>
                    </li>
                    <li>
                      Open{' '}
                      <a href="https://app.usesession.com/sessions" target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        UseSession
                      </a>{' '}
                      (logged in) and click that bookmark once. We&apos;ll detect it here automatically.
                    </li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-3">Waiting for you to click it… code expires in 10 minutes.</p>
                </div>
              )}

              {/* Paste fallback */}
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Prefer not to use a bookmark? Paste your token instead
                </summary>
                <div className="mt-3">
                  <textarea
                    value={pasteToken}
                    onChange={(e) => setPasteToken(e.target.value)}
                    placeholder="Paste your UseSession session-token here"
                    className="w-full text-sm border border-gray-200 rounded-lg p-3 h-20 font-mono"
                  />
                  <button
                    onClick={connectWithToken}
                    disabled={connecting || !pasteToken.trim()}
                    className="mt-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    Connect with token
                  </button>
                </div>
              </details>

              {/* Trust copy */}
              <div className="mt-5 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <ShieldCheckIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>
                  Your UseSession access is <strong>AES-256 encrypted</strong> and used only to read <em>your</em>{' '}
                  upcoming bookings so reminders can send. We never store, mine, share, or sell your client data, and
                  you can disconnect anytime.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        {settings && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Reminder settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Studio name</label>
                <input
                  value={settings.studioName}
                  onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder message template
                </label>
                <textarea
                  value={settings.reminderTemplate}
                  onChange={(e) => setSettings({ ...settings, reminderTemplate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Placeholders: {'{name}'} {'{sessionTitle}'} {'{sessionTime}'} {'{studioName}'}
                </p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Send reminders</label>
                  <div className="flex gap-2">
                    {[7, 3, 2, 1].map((d) => {
                      const on = settings.offsetsDays.includes(d)
                      return (
                        <button
                          key={d}
                          onClick={() =>
                            setSettings({
                              ...settings,
                              offsetsDays: on
                                ? settings.offsetsDays.filter((x) => x !== d)
                                : [...settings.offsetsDays, d].sort((a, b) => b - a),
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm border ${
                            on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {d}-day
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Auto-schedule new bookings</label>
                  <button
                    onClick={() => setSettings({ ...settings, autoSchedule: !settings.autoSchedule })}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      settings.autoSchedule ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {settings.autoSchedule ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {savingSettings ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </div>
        )}

        {/* CSV import (no-connection fallback) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Import from a CSV</h2>
          <p className="text-xs text-gray-400 mb-4">Works without connecting — great on mobile, or as a backup.</p>
          <CsvImport onImported={loadAll} />
        </div>

        {/* Upcoming auto-scheduled reminders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Upcoming reminders {upcoming.length > 0 && <span className="text-gray-400 font-normal">· {upcoming.length}</span>}
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">
              No reminders scheduled yet. Connect UseSession (or sync) and they&apos;ll appear here automatically.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcoming.slice(0, 50).map((m) => (
                <div key={m.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {m.clientName} <span className="text-gray-400">· {m.sessionTitle}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.reminderType} reminder · sends {new Date(m.scheduledFor).toLocaleString()}
                      {m.source === 'usesession' && ' · auto'}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelReminder(m.id)}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    title="Cancel this reminder"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
          <LockClosedIcon className="w-3.5 h-3.5 mr-1" />
          Your UseSession token is encrypted at rest and never shared.
        </div>
      </div>
    </div>
  )
}
