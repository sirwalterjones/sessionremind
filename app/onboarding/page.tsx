'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'
import { useToast, useConfirm } from '@/components/Notifications'

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

interface Sender {
  status: 'none' | 'provisioning' | 'pending_verification' | 'active' | 'failed'
  phoneNumber?: string
  verificationStatus?: string
  rejectionReason?: string
  error?: string
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

function StatusBanner({ sender }: { sender: Sender }) {
  if (!sender || sender.status === 'none') return null
  const map: Record<string, { icon: any; tone: string; title: string; body: string }> = {
    provisioning: {
      icon: ClockIcon,
      tone: 'border-hairline bg-panel text-ink',
      title: 'Setting up your number…',
      body: 'We are purchasing your dedicated texting number. This usually takes a moment.',
    },
    pending_verification: {
      icon: ClockIcon,
      tone: 'border-hairline bg-panel text-ink',
      title: `Verification pending${sender.phoneNumber ? ` · ${sender.phoneNumber}` : ''}`,
      body: 'Your number is registered and your verification was submitted to the carriers. Approval typically takes 1–3 weeks. Reminders keep sending in the meantime.',
    },
    active: {
      icon: CheckCircleIcon,
      tone: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
      title: `Your number is live${sender.phoneNumber ? ` · ${sender.phoneNumber}` : ''}`,
      body: 'Reminders now send from your own verified texting number.',
    },
    failed: {
      icon: ExclamationTriangleIcon,
      tone: 'border-red-400/30 bg-red-400/10 text-red-700 dark:text-red-300',
      title: 'Setup needs attention',
      body: sender.rejectionReason || sender.error || 'There was a problem. Please review your details below or contact support.',
    },
  }
  const s = map[sender.status]
  if (!s) return null
  const Icon = s.icon
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-5 ${s.tone}`}>
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div>
        <p className="text-[15px] font-semibold">{s.title}</p>
        <p className="mt-1 text-[14px] leading-relaxed opacity-90">{s.body}</p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [provisioning, setProvisioning] = useState(false)
  const [biz, setBiz] = useState<Business>(EMPTY)
  const [sender, setSender] = useState<Sender>({ status: 'none' })
  const [hasSaved, setHasSaved] = useState(false)
  const [eligible, setEligible] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [obRes, meRes] = await Promise.all([fetch('/api/onboarding'), fetch('/api/auth/me')])
        if (obRes.status === 401) {
          router.push('/login')
          return
        }
        if (obRes.ok) {
          const data = await obRes.json()
          if (data.business) {
            setBiz({ ...EMPTY, ...data.business })
            if (data.business.legalName) setHasSaved(true)
          }
          if (data.sender) setSender(data.sender)
        }
        if (meRes.ok) {
          const me = (await meRes.json()).user
          // Mirror the server gate (canProvision): a real paid Stripe sub, or admin/override.
          setEligible(
            Boolean(
              me?.is_admin ||
                me?.payment_override ||
                (me?.stripe_subscription_id && me?.subscription_status === 'active')
            )
          )
        }
      } catch {
        /* noop */
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  const set = (k: keyof Business) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBiz((b) => ({ ...b, [k]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(biz),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save')
      setHasSaved(true)
      toast.success('Business details saved.')
    } catch (err: any) {
      toast.error(err?.message || 'Could not save your details.')
    } finally {
      setSaving(false)
    }
  }

  const provision = async () => {
    const ok = await confirm({
      title: 'Create your texting number?',
      message:
        'We’ll register a dedicated toll-free texting number for your business and submit it for carrier verification. Your reminders will send from it once approved (usually 1–3 weeks).',
      confirmLabel: 'Create my number',
    })
    if (!ok) return
    setProvisioning(true)
    try {
      const res = await fetch('/api/onboarding/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provision' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create your number')
      if (data.sender) setSender(data.sender)
      toast.success(`Number registered${data.sender?.phoneNumber ? ` · ${data.sender.phoneNumber}` : ''} — verification submitted.`)
    } catch (err: any) {
      toast.error(err?.message || 'Could not create your number.')
    } finally {
      setProvisioning(false)
    }
  }

  const refresh = async () => {
    setProvisioning(true)
    try {
      const res = await fetch('/api/onboarding/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not refresh')
      if (data.sender) setSender(data.sender)
      toast.success(`Status: ${data.sender?.status?.replace('_', ' ') || 'unknown'}`)
    } catch (err: any) {
      toast.error(err?.message || 'Could not refresh status.')
    } finally {
      setProvisioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="eyebrow animate-pulse">Loading…</div>
      </div>
    )
  }

  const editable = sender.status === 'none' || sender.status === 'failed'
  // 'provisioning' that persists to a page load means a prior run crashed/timed
  // out — surface the create button so the user can retry (the server reuses any
  // already-purchased number rather than buying another).
  const showGetNumber = editable || sender.status === 'provisioning'
  const input = 'w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40'

  return (
    <div className="text-ink">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.push('/connect')}
          aria-label="Back"
          className="mt-1 rounded-full border border-hairline p-2 text-ink transition-colors hover:bg-ink/5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <div>
          <div className="eyebrow mb-2">Your texting number</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.0]">Get your own number</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Reminders send from a dedicated number registered to your business. We handle the carrier registration and
            consent paperwork for you — just confirm your business details below and create your number.
          </p>
        </div>
      </div>

      <div className="mt-8 grid max-w-5xl items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ───────── Left: compact business form ───────── */}
        <form onSubmit={save} className="min-w-0 rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
          <div>
            <h2 className="font-display text-xl font-semibold">Business details</h2>
            <p className="mt-1.5 text-[14px] text-muted">
              Use your real, legal business information — the carriers verify it against public records.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-2 block">Legal business name</label>
              <input className={input} value={biz.legalName} onChange={set('legalName')} disabled={!editable} required />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Website</label>
              <input className={input} value={biz.website} onChange={set('website')} disabled={!editable} placeholder="https://…" required />
            </div>

            <div className="sm:col-span-2">
              <label className="eyebrow mb-2 block">Street address</label>
              <input className={input} value={biz.addressStreet} onChange={set('addressStreet')} disabled={!editable} required />
            </div>

            <div className="grid grid-cols-3 gap-4 sm:col-span-2">
              <div>
                <label className="eyebrow mb-2 block">City</label>
                <input className={input} value={biz.addressCity} onChange={set('addressCity')} disabled={!editable} required />
              </div>
              <div>
                <label className="eyebrow mb-2 block">State</label>
                <input className={input} value={biz.addressState} onChange={set('addressState')} disabled={!editable} required />
              </div>
              <div>
                <label className="eyebrow mb-2 block">ZIP</label>
                <input className={input} value={biz.addressZip} onChange={set('addressZip')} disabled={!editable} required />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-2 block">Contact first name</label>
              <input className={input} value={biz.contactFirstName} onChange={set('contactFirstName')} disabled={!editable} required />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Contact last name</label>
              <input className={input} value={biz.contactLastName} onChange={set('contactLastName')} disabled={!editable} required />
            </div>

            <div>
              <label className="eyebrow mb-2 block">Contact email</label>
              <input type="email" className={input} value={biz.contactEmail} onChange={set('contactEmail')} disabled={!editable} required />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Contact phone</label>
              <input className={input} value={biz.contactPhone} onChange={set('contactPhone')} disabled={!editable} placeholder="+1…" required />
            </div>
          </div>

          <div className="mt-6">
            {editable ? (
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-accent px-6 py-2.5 text-accent-ink font-semibold transition-all hover:shadow-glow disabled:opacity-50"
              >
                {saving ? 'Saving…' : hasSaved ? 'Update details' : 'Save business details'}
              </button>
            ) : (
              <p className="text-[14px] text-muted">
                Your details are locked while verification is in progress. Need a change? Email{' '}
                <a href="mailto:support@sessionremind.com" className="text-accent underline">
                  support@sessionremind.com
                </a>
                .
              </p>
            )}
          </div>
        </form>

        {/* ───────── Right rail: status + actions ───────── */}
        <aside className="space-y-5 lg:sticky lg:top-8">
          <StatusBanner sender={sender} />

          {/* Step 2 — create the number */}
          {showGetNumber && (
            <div className="rounded-2xl border border-hairline bg-panel p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-accent-ink" />
                </div>
                <h2 className="font-display text-lg font-semibold">Create your texting number</h2>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                A dedicated number registered to your business — an upgrade from the shared SessionRemind number.
                Included with your subscription. Here’s exactly what happens:
              </p>
              <ol className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-muted">
                <li><strong>1.</strong> We register a toll-free number to your business and submit it to the carriers.</li>
                <li><strong>2.</strong> The carriers verify it — this typically takes <strong>1–3 weeks</strong>.</li>
                <li><strong>3.</strong> <strong>We email you the moment it’s approved</strong> (or if anything needs fixing). Your reminders keep sending on the shared number until then — nothing pauses.</li>
              </ol>

              {!hasSaved && (
                <p className="mt-3 text-[14px] text-red-700 dark:text-red-300">Save your business details first.</p>
              )}
              {hasSaved && !eligible && (
                <p className="mt-3 text-[14px] text-red-700 dark:text-red-300">
                  A dedicated number is included with an active subscription.{' '}
                  <button onClick={() => router.push('/payment-required')} className="underline">
                    Subscribe
                  </button>{' '}
                  to enable it.
                </p>
              )}

              <button
                onClick={provision}
                disabled={provisioning || !hasSaved || !eligible}
                className="mt-4 w-full rounded-full bg-accent px-6 py-2.5 text-accent-ink font-semibold transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              >
                {provisioning ? 'Creating…' : sender.status === 'none' ? 'Create my number' : 'Try again'}
              </button>
            </div>
          )}

          {/* Pending — let them re-check */}
          {sender.status === 'pending_verification' && (
            <div className="rounded-2xl border border-hairline bg-panel p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold">Check verification status</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">
                We’ll email you when it’s approved. You can also re-check now.
              </p>
              <button
                onClick={refresh}
                disabled={provisioning}
                className="mt-4 w-full rounded-full border border-hairline px-6 py-2.5 font-medium text-ink transition-colors hover:bg-ink/5 disabled:opacity-50"
              >
                {provisioning ? 'Checking…' : 'Refresh status'}
              </button>
            </div>
          )}

          <p className="text-[13px] leading-relaxed text-faint">
            Clients consent to reminders when they book and provide their number; messages are appointment reminders only
            and every recipient can reply STOP to opt out. See our{' '}
            <a href="/sms-opt-in" className="underline">
              messaging terms
            </a>
            .
          </p>
        </aside>
      </div>
    </div>
  )
}
