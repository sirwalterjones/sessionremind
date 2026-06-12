'use client'

// Post-payment onboarding wizard. New subscribers land here after Stripe
// checkout (see app/payment-required/page.tsx) and get walked through:
//   01 Connect UseSession  →  02 Your texting number  →  03 Done
// Every step is skippable, and steps that are already complete show as done.

import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Notifications'
import { buildConnectorBookmarklet } from '@/lib/bookmarklet'
import { prettyUsNumber } from '@/components/SetupStatus'
import { ClipboardDocumentIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

interface Sender {
  status: 'none' | 'provisioning' | 'pending_verification' | 'active' | 'failed'
  phoneNumber?: string
  verificationStatus?: string
  rejectionReason?: string
  error?: string
}

interface Business {
  legalName: string
  website: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  addressCountry: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string
}

const EMPTY: Business = {
  legalName: '',
  website: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  addressCountry: 'US',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
}

const STEPS = [
  { n: '01', label: 'Connect' },
  { n: '02', label: 'Your number' },
  { n: '03', label: 'Done' },
] as const

// Exact reassurance copy — shared promise with the rest of the product.
const PENDING_REASSURANCE =
  "Your text reminders keep sending normally while you wait — nothing pauses. We'll email you the moment it's approved (typically a few days to ~3 weeks)."

const input =
  'w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40'
const primaryBtn =
  'rounded-full bg-accent px-6 py-2.5 text-accent-ink font-semibold transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50'
const secondaryBtn =
  'rounded-full border border-hairline px-6 py-2.5 font-medium text-ink transition-colors hover:bg-ink/5 disabled:opacity-50'

export default function WelcomePage() {
  const router = useRouter()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 — UseSession connection
  const [connected, setConnected] = useState(false)
  const [pairCode, setPairCode] = useState('')
  const [bookmarklet, setBookmarklet] = useState('')
  const [connecting, setConnecting] = useState(false)

  // Step 2 — dedicated texting number
  const [sender, setSender] = useState<Sender>({ status: 'none' })
  const [showForm, setShowForm] = useState(false)
  const [biz, setBiz] = useState<Business>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }
  useEffect(() => stopPolling, [])

  // Load what's already done so completed steps show as complete.
  useEffect(() => {
    ;(async () => {
      try {
        const [sRes, obRes] = await Promise.all([fetch('/api/settings'), fetch('/api/onboarding')])
        if (sRes.status === 401 || obRes.status === 401) {
          router.push('/login')
          return
        }
        if (sRes.ok) {
          const data = await sRes.json()
          setConnected(Boolean(data?.settings?.usesession?.connected))
        }
        if (obRes.ok) {
          const data = await obRes.json()
          if (data.business) setBiz((b) => ({ ...b, ...data.business }))
          if (data.sender) setSender(data.sender)
        }
      } catch {
        /* show the wizard anyway — every call is retried by the steps themselves */
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  // ── Step 1: pairing + bookmarklet (same flow as the Connect page) ────────
  const startConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/usesession/pair', { method: 'POST' })
      if (!res.ok) throw new Error('Could not start connect')
      const { code } = await res.json()
      setPairCode(code)
      setBookmarklet(buildConnectorBookmarklet(window.location.origin, code))
      pollForConnection()
    } catch {
      toast.error('Could not start the connect process. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  // Poll until the bookmarklet reports back and the account is connected,
  // then show the success state and move on to step 2.
  const pollForConnection = () => {
    stopPolling()
    let tries = 0
    pollRef.current = setInterval(async () => {
      tries++
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data?.settings?.usesession?.connected) {
            stopPolling()
            setConnected(true)
            setPairCode('')
            setBookmarklet('')
            toast.success('UseSession connected! Your bookings are syncing.')
            setTimeout(() => setStep((s) => (s === 1 ? 2 : s)), 1500)
            return
          }
        }
      } catch {
        /* transient — keep polling */
      }
      if (tries > 300) stopPolling() // pairing code expires after 10 minutes
    }, 2000)
  }

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarklet)
    toast.success('Connect link copied. Create a bookmark and paste it as the URL.')
  }

  const skipConnect = () => {
    stopPolling()
    setPairCode('')
    setBookmarklet('')
    setStep(2)
  }

  // ── Step 2: business details → PUT /api/onboarding → provision ──────────
  const setBizField = (k: keyof Business) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBiz((b) => ({ ...b, [k]: e.target.value }))

  const getNumber = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const saveRes = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(biz),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveData.error || 'Could not save your business details.')

      const provRes = await fetch('/api/onboarding/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provision' }),
      })
      const provData = await provRes.json()
      if (!provRes.ok) throw new Error(provData.error || 'Could not create your number.')
      if (provData.sender) setSender(provData.sender)
      setShowForm(false)
      toast.success(
        `Number registered${provData.sender?.phoneNumber ? ` · ${prettyUsNumber(provData.sender.phoneNumber)}` : ''} — verification submitted.`
      )
    } catch (err: any) {
      toast.error(err?.message || 'Could not create your number.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="eyebrow animate-pulse">Loading&hellip;</div>
      </div>
    )
  }

  const numberDone = sender.status === 'pending_verification' || sender.status === 'active'
  const pretty = prettyUsNumber(sender.phoneNumber)

  return (
    <div className="mx-auto max-w-2xl text-ink">
      {/* Header */}
      <div className="border-b border-hairline pb-8 mb-8">
        <p className="eyebrow mb-3">Welcome to SessionRemind</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
          Let&apos;s get you set up.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Two quick steps — both skippable — and your clients start getting automatic
          session reminders.
        </p>
        {/* Progress */}
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em]">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              {i > 0 && <span className="text-hairline select-none">·</span>}
              <span
                className={
                  i + 1 === step
                    ? 'text-ink'
                    : i + 1 < step
                      ? 'text-[#16a34a]'
                      : 'text-faint'
                }
              >
                {i + 1 < step ? '✓' : s.n} {s.label}
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* ── STEP 1 — Connect UseSession ─────────────────────────────────── */}
      {step === 1 && (
        <div className="rounded-2xl border border-hairline p-6 sm:p-8">
          {connected ? (
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[11px] font-bold text-white">
                  ✓
                </span>
                <h2 className="font-display text-xl font-semibold">UseSession connected</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Your bookings sync automatically — new sessions, reschedules, and cancellations
                are handled for you, and reminders schedule themselves.
              </p>
              <button onClick={() => setStep(2)} className={`${primaryBtn} mt-5`}>
                Continue
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <h2 className="font-display text-xl font-semibold">Connect your UseSession account</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted mb-5">
                Connect once and your bookings sync on their own — every client gets a text
                reminder before their session, automatically.
              </p>

              {!pairCode ? (
                <div>
                  <button onClick={startConnect} disabled={connecting} className={primaryBtn}>
                    {connecting ? 'Starting…' : 'Connect UseSession'}
                  </button>
                  <p className="mt-3 max-w-md text-xs text-muted">
                    One button to drag, one click on UseSession — about a minute. We grab what we
                    need automatically.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-hairline bg-panel p-5">
                  <p className="font-display text-sm font-semibold mb-4">Almost there — two steps:</p>
                  <ol className="list-decimal list-inside space-y-4 text-sm text-ink/80">
                    <li>
                      Drag this button to your bookmarks bar (or{' '}
                      <button
                        onClick={copyBookmarklet}
                        className="inline-flex items-center gap-0.5 text-accent underline"
                      >
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" />
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
                      <p className="mt-2 text-xs text-muted">
                        Can&apos;t drag it?{' '}
                        <button onClick={copyBookmarklet} className="text-accent underline">
                          Copy the link
                        </button>
                        , then make a new bookmark and paste it as the URL.
                      </p>
                    </li>
                    <li>
                      Open{' '}
                      <a
                        href="https://app.usesession.com/sessions"
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline"
                      >
                        UseSession
                      </a>{' '}
                      (logged in) and click that bookmark once. We&apos;ll detect it here
                      automatically. Clicked it from the wrong tab? It opens UseSession for you —
                      sign in and click it again there.
                    </li>
                  </ol>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    Waiting for you to click it · code expires in 10 minutes
                  </p>
                </div>
              )}

              {/* Computer-only hint */}
              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-hairline bg-panel p-4 text-xs text-muted">
                <ComputerDesktopIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="leading-relaxed">
                  This one-time step needs a <strong className="font-medium text-ink">computer</strong>{' '}
                  (any browser). On your phone right now? Skip for now and connect later from the
                  Connect page — everything else works from anywhere.
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button onClick={skipConnect} className={secondaryBtn}>
                  Skip for now
                </button>
                <span className="text-xs text-faint">
                  You can connect anytime from the Connect page.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 — Your texting number ────────────────────────────────── */}
      {step === 2 && (
        <div className="rounded-2xl border border-hairline p-6 sm:p-8">
          {numberDone ? (
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                {sender.status === 'active' ? (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[11px] font-bold text-white">
                    ✓
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#d97706]" />
                )}
                <h2 className="font-display text-xl font-semibold">
                  {sender.status === 'active'
                    ? `Your number is live${pretty ? ` · ${pretty}` : ''}`
                    : `Your number is registered${pretty ? ` · ${pretty}` : ''}`}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {sender.status === 'active'
                  ? 'Reminders send from your own verified texting number. Nothing more to do.'
                  : PENDING_REASSURANCE}
              </p>
              <button onClick={() => setStep(3)} className={`${primaryBtn} mt-5`}>
                Continue
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <h2 className="font-display text-xl font-semibold">Your texting number</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Your reminders start sending <strong className="font-medium text-ink">immediately</strong>{' '}
                from SessionRemind&apos;s shared number — nothing to set up. If you&apos;d like, we can
                also register a dedicated number to your business (included with your plan), so texts
                come from a number that&apos;s yours.
              </p>

              {!showForm ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button onClick={() => setShowForm(true)} className={primaryBtn}>
                    Get my number
                  </button>
                  <button onClick={() => setStep(3)} className={secondaryBtn}>
                    Use the shared number for now
                  </button>
                </div>
              ) : (
                <form onSubmit={getNumber} className="mt-6 space-y-5">
                  <p className="text-[13px] leading-relaxed text-muted">
                    Use your real, legal business information — the carriers verify it against
                    public records.
                  </p>

                  <div>
                    <label className="eyebrow mb-2 block">Legal business name</label>
                    <input className={input} value={biz.legalName} onChange={setBizField('legalName')} required />
                  </div>

                  <div>
                    <label className="eyebrow mb-2 block">Website</label>
                    <input className={input} value={biz.website} onChange={setBizField('website')} placeholder="https://…" required />
                  </div>

                  <div>
                    <label className="eyebrow mb-2 block">Street address</label>
                    <input className={input} value={biz.addressStreet} onChange={setBizField('addressStreet')} required />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="eyebrow mb-2 block">City</label>
                      <input className={input} value={biz.addressCity} onChange={setBizField('addressCity')} required />
                    </div>
                    <div>
                      <label className="eyebrow mb-2 block">State</label>
                      <input className={input} value={biz.addressState} onChange={setBizField('addressState')} required />
                    </div>
                    <div>
                      <label className="eyebrow mb-2 block">ZIP</label>
                      <input className={input} value={biz.addressZip} onChange={setBizField('addressZip')} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="eyebrow mb-2 block">Contact first name</label>
                      <input className={input} value={biz.contactFirstName} onChange={setBizField('contactFirstName')} required />
                    </div>
                    <div>
                      <label className="eyebrow mb-2 block">Contact last name</label>
                      <input className={input} value={biz.contactLastName} onChange={setBizField('contactLastName')} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="eyebrow mb-2 block">Contact email</label>
                      <input type="email" className={input} value={biz.contactEmail} onChange={setBizField('contactEmail')} required />
                    </div>
                    <div>
                      <label className="eyebrow mb-2 block">Contact phone</label>
                      <input className={input} value={biz.contactPhone} onChange={setBizField('contactPhone')} placeholder="+1…" required />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button type="submit" disabled={submitting} className={primaryBtn}>
                      {submitting ? 'Creating your number…' : 'Register my number'}
                    </button>
                    <button type="button" onClick={() => setStep(3)} disabled={submitting} className={secondaryBtn}>
                      Skip for now
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3 — Done ───────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="rounded-2xl border border-hairline p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[11px] font-bold text-white">
              ✓
            </span>
            <h2 className="font-display text-xl font-semibold">You&apos;re all set.</h2>
          </div>
          <p className="text-sm text-muted">Here&apos;s where everything stands:</p>

          <ul className="mt-5 divide-y divide-hairline">
            <li className="flex items-start gap-3 py-3.5">
              <span
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: connected ? '#16a34a' : '#9ca3af' }}
              />
              <div>
                <p className="eyebrow mb-0.5">UseSession</p>
                <p className="text-sm leading-relaxed text-ink">
                  {connected ? (
                    'Connected — bookings sync automatically'
                  ) : (
                    <>
                      Skipped — connect anytime from the{' '}
                      <Link href="/connect" className="text-accent underline">
                        Connect page
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 py-3.5">
              <span
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{
                  background:
                    sender.status === 'active'
                      ? '#16a34a'
                      : numberDone
                        ? '#d97706'
                        : '#9ca3af',
                }}
              />
              <div>
                <p className="eyebrow mb-0.5">Texting number</p>
                <p className="text-sm leading-relaxed text-ink">
                  {sender.status === 'active'
                    ? `Your dedicated number${pretty ? ` · ${pretty}` : ''}`
                    : numberDone
                      ? `Verification pending${pretty ? ` · ${pretty}` : ''} — texts keep sending meanwhile`
                      : 'Shared SessionRemind number — get your own anytime'}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 py-3.5">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#16a34a]" />
              <div>
                <p className="eyebrow mb-0.5">Reminders</p>
                <p className="text-sm leading-relaxed text-ink">
                  3-day &amp; 1-day before each session, automatic — customize anytime on the
                  Connect page
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button onClick={() => router.push('/dashboard')} className={primaryBtn}>
              Go to my dashboard
            </button>
            <Link
              href="/help"
              className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Need a hand? Visit help
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
