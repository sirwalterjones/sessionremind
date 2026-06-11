'use client'

// Live setup/status surfaces for the two places photographers look:
//   <TextingNumberCard />     — the Connect page's "Your texting number" card
//   <DashboardSetupStatus />  — compact status card at the top of the dashboard
// Both read the tenant's dedicated-number state from /api/onboarding and (for
// the dashboard) the UseSession connection from /api/settings.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

interface Sender {
  status: 'none' | 'provisioning' | 'pending_verification' | 'active' | 'failed'
  phoneNumber?: string
  verificationStatus?: string
  rejectionReason?: string
}

export function prettyUsNumber(e164?: string): string {
  if (!e164) return ''
  const d = e164.replace(/[^\d]/g, '')
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d
  if (ten.length !== 10) return e164
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}

const DOT: Record<Sender['status'], string> = {
  none: '#6E736C',
  provisioning: '#fcd34d',
  pending_verification: '#fcd34d',
  active: '#34d399',
  failed: '#f87171',
}

const BADGE: Record<Sender['status'], string> = {
  none: 'Shared number',
  provisioning: 'Setting up…',
  pending_verification: 'Verification pending',
  active: 'Live',
  failed: 'Needs attention',
}

function useSenderStatus() {
  const [sender, setSender] = useState<Sender>({ status: 'none' })
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    fetch('/api/onboarding')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.sender) setSender(d.sender)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])
  return { sender, loaded }
}

function StatusBadge({ sender }: { sender: Sender }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT[sender.status] }} />
      {BADGE[sender.status]}
    </span>
  )
}

// ─── Connect page card ──────────────────────────────────────────────────────

export function TextingNumberCard() {
  const { sender } = useSenderStatus()
  const pretty = prettyUsNumber(sender.phoneNumber)

  const body = (() => {
    switch (sender.status) {
      case 'active':
        return (
          <>
            Your reminders send from your own number
            {pretty ? (
              <>
                {' '}
                — <strong className="font-medium text-ink">{pretty}</strong>
              </>
            ) : null}
            . Nothing more to do.
          </>
        )
      case 'provisioning':
      case 'pending_verification':
        return (
          <>
            {pretty ? (
              <>
                <strong className="font-medium text-ink">{pretty}</strong> is registered to your
                business and{' '}
              </>
            ) : (
              'Your number is registered and '
            )}
            waiting on carrier verification (typically a few days to ~3 weeks — we&apos;ll email you
            the moment it&apos;s approved).{' '}
            <strong className="font-medium text-ink">
              Your text reminders keep sending normally while you wait
            </strong>{' '}
            — nothing pauses.
          </>
        )
      case 'failed':
        return (
          <>
            The carriers couldn&apos;t verify your number
            {sender.rejectionReason ? <> ({sender.rejectionReason})</> : null}. Your reminders are
            still sending from the shared number — nothing is interrupted. Review your details and
            try again.
          </>
        )
      default:
        return (
          <>
            Send reminders from a dedicated number registered to your business. We register and
            verify it for you — no separate texting account needed.
          </>
        )
    }
  })()

  const cta =
    sender.status === 'none'
      ? 'Set up →'
      : sender.status === 'failed'
        ? 'Review & retry →'
        : 'View status →'

  return (
    <Link
      href="/onboarding"
      className="group flex items-center gap-4 rounded-2xl border border-hairline bg-panel p-6 sm:p-8 transition-colors hover:bg-card"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent">
        <DevicePhoneMobileIcon className="h-5 w-5 text-accent-ink" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-display text-xl font-semibold text-ink">Your texting number</h2>
          {sender.status !== 'none' && <StatusBadge sender={sender} />}
        </div>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
      </div>
      <span className="hidden flex-shrink-0 text-sm font-medium text-muted transition-colors group-hover:text-ink sm:inline">
        {cta}
      </span>
    </Link>
  )
}

// ─── Dashboard status card ──────────────────────────────────────────────────

export function DashboardSetupStatus() {
  const { sender, loaded } = useSenderStatus()
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setConnected(Boolean(d?.settings?.usesession?.connected)))
      .catch(() => setConnected(null))
  }, [])

  // Don't flash an empty card while loading.
  if (!loaded && connected === null) return null

  const pretty = prettyUsNumber(sender.phoneNumber)
  const numberLine = (() => {
    switch (sender.status) {
      case 'active':
        return `Your dedicated number${pretty ? ` · ${pretty}` : ''}`
      case 'provisioning':
      case 'pending_verification':
        return `Verification pending${pretty ? ` · ${pretty}` : ''} — texts still send meanwhile`
      case 'failed':
        return 'Verification needs attention'
      default:
        return 'Shared SessionRemind number'
    }
  })()

  return (
    <div className="mb-10 rounded-2xl border border-hairline bg-panel">
      <div className="flex flex-col divide-y divide-hairline sm:flex-row sm:divide-x sm:divide-y-0">
        {/* UseSession connection */}
        <Link
          href="/connect"
          className="group flex flex-1 items-center justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-card"
        >
          <div className="min-w-0">
            <p className="eyebrow mb-1">UseSession</p>
            <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: connected ? '#34d399' : '#C6F24E' }}
              />
              {connected ? 'Connected — bookings sync automatically' : 'Not connected'}
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-medium text-faint transition-colors group-hover:text-ink">
            {connected ? 'Manage →' : 'Connect →'}
          </span>
        </Link>

        {/* Texting number */}
        <Link
          href="/onboarding"
          className="group flex flex-1 items-center justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-card"
        >
          <div className="min-w-0">
            <p className="eyebrow mb-1">Texting number</p>
            <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: DOT[sender.status] }}
              />
              {numberLine}
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-medium text-faint transition-colors group-hover:text-ink">
            {sender.status === 'none' ? 'Get yours →' : 'Status →'}
          </span>
        </Link>
      </div>
    </div>
  )
}
