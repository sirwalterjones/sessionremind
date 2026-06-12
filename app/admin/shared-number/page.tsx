'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
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

// The provisioning state of the pseudo-tenant that backs the shared number.
interface State {
  status?: 'none' | 'provisioning' | 'pending_verification' | 'active' | 'failed'
  phoneNumber?: string
  verificationStatus?: string
  rejectionReason?: string
  error?: string
}
// The live shared slot every studio falls back to (populated once approved).
interface Sender {
  messagingServiceSid?: string
  phoneNumber?: string
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

export default function SharedNumberAdminPage() {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [biz, setBiz] = useState<Business>(EMPTY)
  const [state, setState] = useState<State>({ status: 'none' })
  const [sender, setSender] = useState<Sender | null>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/shared-sender')
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setSender(data.sender || null)
        setState(data.state || { status: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k: keyof Business) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBiz((b) => ({ ...b, [k]: e.target.value }))

  const provision = async () => {
    const required = Object.entries(biz).filter(([k]) => k !== 'addressCountry')
    if (required.some(([, v]) => !String(v).trim())) {
      toast.error('Fill in all business fields first.')
      return
    }
    const ok = await confirm({
      title: 'Provision the shared number?',
      message:
        'Buys ONE SessionRemind toll-free number (~$2/mo) and submits it for carrier verification under SessionRemind’s business. Every studio sends through it once approved (~1–3 weeks).',
      confirmLabel: 'Buy + verify',
    })
    if (!ok) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/shared-sender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provision', business: biz }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Provisioning failed')
      if (data.sender) setState(data.sender) // provisionResult.sender = the pseudo-tenant state
      toast.success(`Registered${data.sender?.phoneNumber ? ` · ${data.sender.phoneNumber}` : ''} — verification submitted.`)
      load()
    } catch (err: any) {
      toast.error(err?.message || 'Provisioning failed.')
    } finally {
      setBusy(false)
    }
  }

  const refresh = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/shared-sender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refresh failed')
      if (data.sender) setState(data.sender)
      toast.success(`Status: ${data.sender?.status?.replace('_', ' ') || 'unknown'}`)
      load()
    } catch (err: any) {
      toast.error(err?.message || 'Refresh failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="eyebrow animate-pulse">Loading…</div>
      </div>
    )
  }

  const live = Boolean(sender?.messagingServiceSid || sender?.phoneNumber) || state.status === 'active'
  const status = live ? 'active' : state.status || 'none'
  const editable = status === 'none' || status === 'failed'
  const input = 'w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:bg-panel disabled:text-faint'
  const tone: Record<string, string> = {
    none: 'border-hairline bg-panel',
    provisioning: 'border-hairline bg-panel',
    pending_verification: 'border-amber-300/20 bg-amber-300/10 text-amber-700 dark:text-amber-200',
    active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
    failed: 'border-red-400/30 bg-red-500/15 text-red-700 dark:text-red-300',
  }
  const StatusIcon = status === 'active' ? CheckCircleIcon : status === 'failed' ? ExclamationTriangleIcon : ClockIcon
  const phone = sender?.phoneNumber || state.phoneNumber

  return (
    <div className="text-ink">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.push('/admin')}
          aria-label="Back to admin"
          className="mt-1 rounded-full border border-hairline p-2 text-ink transition-colors hover:bg-ink/5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <div>
          <div className="eyebrow mb-2">Operator · shared number</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.0]">Shared sending number</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            The one SessionRemind toll-free number every studio sends through by default. Verify it once; after that
            new studios are instant. Studios can still upgrade to their own number anytime.
          </p>
        </div>
      </div>

      <div className="mt-10 max-w-2xl space-y-6">
        {status !== 'none' && (
          <div className={`flex items-start gap-3 rounded-2xl border p-5 ${tone[status] || tone.none}`}>
            <StatusIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-[15px] font-semibold capitalize">
                {status.replace('_', ' ')}
                {phone ? ` · ${phone}` : ''}
              </p>
              {status === 'pending_verification' && (
                <p className="mt-1 text-[14px] opacity-80">Submitted to the carriers — approval typically takes 1–3 weeks.</p>
              )}
              {state.verificationStatus && <p className="mt-1 text-[14px] opacity-80">Verification: {state.verificationStatus}</p>}
              {(state.rejectionReason || state.error) && <p className="mt-1 text-[14px]">{state.rejectionReason || state.error}</p>}
            </div>
          </div>
        )}

        {editable && (
          <div className="rounded-2xl border border-hairline bg-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">SessionRemind business details</h2>
              <p className="mt-1.5 text-[14px] text-muted">Used to verify the shared number with the carriers.</p>
            </div>
            <div>
              <label className="eyebrow mb-2 block">Legal business name</label>
              <input className={input} value={biz.legalName} onChange={set('legalName')} required />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Website</label>
              <input className={input} value={biz.website} onChange={set('website')} placeholder="https://sessionremind.com" />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Street address</label>
              <input className={input} value={biz.addressStreet} onChange={set('addressStreet')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="eyebrow mb-2 block">City</label>
                <input className={input} value={biz.addressCity} onChange={set('addressCity')} />
              </div>
              <div>
                <label className="eyebrow mb-2 block">State</label>
                <input className={input} value={biz.addressState} onChange={set('addressState')} />
              </div>
              <div>
                <label className="eyebrow mb-2 block">ZIP</label>
                <input className={input} value={biz.addressZip} onChange={set('addressZip')} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow mb-2 block">Contact first name</label>
                <input className={input} value={biz.contactFirstName} onChange={set('contactFirstName')} />
              </div>
              <div>
                <label className="eyebrow mb-2 block">Contact last name</label>
                <input className={input} value={biz.contactLastName} onChange={set('contactLastName')} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow mb-2 block">Contact email</label>
                <input type="email" className={input} value={biz.contactEmail} onChange={set('contactEmail')} />
              </div>
              <div>
                <label className="eyebrow mb-2 block">Contact phone</label>
                <input className={input} value={biz.contactPhone} onChange={set('contactPhone')} placeholder="+1…" />
              </div>
            </div>
            <button
              onClick={provision}
              disabled={busy}
              className="rounded-full bg-accent px-6 py-2.5 text-accent-ink font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Working…' : status === 'failed' ? 'Try again' : 'Buy + verify shared number'}
            </button>
          </div>
        )}

        {(status === 'pending_verification' || status === 'provisioning') && (
          <div className="rounded-2xl border border-hairline bg-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold">Check verification status</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">
              The cron re-checks automatically every few minutes and emails on approval. You can also re-check now.
            </p>
            <button
              onClick={refresh}
              disabled={busy}
              className="mt-4 rounded-full border border-hairline px-6 py-2.5 font-medium text-ink transition-colors hover:bg-ink/5 disabled:opacity-50"
            >
              {busy ? 'Checking…' : 'Refresh status'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
