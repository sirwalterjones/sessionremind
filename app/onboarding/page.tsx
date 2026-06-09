'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/Notifications'

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
  optInType: string
  optInDetails: string
  messageSample: string
  monthlyVolume: string
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
  optInType: 'WEB_FORM',
  optInDetails:
    'Clients provide their mobile number when booking a session through our UseSession booking page and agree to receive reminder texts about that session.',
  messageSample:
    'Hi Jordan! Reminder: your Family Portrait session is on Sat Jun 14 at 10:00 AM. See you then! Moments by Candice',
  monthlyVolume: '100',
}

const VOLUMES = ['10', '100', '1,000', '10,000', '100,000']
const OPT_IN_TYPES = [
  { value: 'WEB_FORM', label: 'Web form (booking page)' },
  { value: 'VERBAL', label: 'Verbal' },
  { value: 'PAPER_FORM', label: 'Paper form' },
  { value: 'VIA_TEXT', label: 'Via text' },
  { value: 'MOBILE_QR_CODE', label: 'Mobile QR code' },
]

function StatusBanner({ sender }: { sender: Sender }) {
  if (!sender || sender.status === 'none') return null
  const map: Record<string, { icon: any; tone: string; title: string; body: string }> = {
    provisioning: {
      icon: ClockIcon,
      tone: 'border-hairline bg-[#FAFAF8] text-ink',
      title: 'Setting up your number…',
      body: 'We are purchasing your dedicated texting number. This usually takes a moment.',
    },
    pending_verification: {
      icon: ClockIcon,
      tone: 'border-hairline bg-[#FAFAF8] text-ink',
      title: `Verification pending${sender.phoneNumber ? ` · ${sender.phoneNumber}` : ''}`,
      body: 'Your number is registered and your toll-free verification was submitted to the carriers. Approval typically takes 1–3 weeks. Reminders keep sending in the meantime.',
    },
    active: {
      icon: CheckCircleIcon,
      tone: 'border-[#BFE3C9] bg-[#F1FAF3] text-ink',
      title: `Your number is live${sender.phoneNumber ? ` · ${sender.phoneNumber}` : ''}`,
      body: 'Reminders now send from your own verified texting number.',
    },
    failed: {
      icon: ExclamationTriangleIcon,
      tone: 'border-[#E7C3B8] bg-[#FBF4F1] text-[#B23A1E]',
      title: 'Verification needs attention',
      body: sender.rejectionReason || sender.error || 'There was a problem. Please review your details below and contact support.',
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [biz, setBiz] = useState<Business>(EMPTY)
  const [sender, setSender] = useState<Sender>({ status: 'none' })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/onboarding')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (res.ok) {
          const data = await res.json()
          if (data.business) setBiz({ ...EMPTY, ...data.business })
          if (data.sender) setSender(data.sender)
        }
      } catch {
        /* noop */
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  const set = (k: keyof Business) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
      toast.success('Business details saved. We’ll register your texting number and let you know when it’s live.')
    } catch (err: any) {
      toast.error(err?.message || 'Could not save your details.')
    } finally {
      setSaving(false)
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
  const input =
    'w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none disabled:bg-[#FAFAF8] disabled:text-[#9A958C]'

  return (
    <div className="text-ink">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          aria-label="Back to dashboard"
          className="mt-1 rounded-full border border-hairline p-2 text-ink transition-colors hover:bg-[#FAFAF8]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <div>
          <div className="eyebrow mb-2">Your texting number</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.0]">Get your own number</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#6E6A63]">
            Reminders send from a dedicated texting number registered to your business. The carriers require a few
            business details to verify it — we handle the rest. No separate texting account needed.
          </p>
        </div>
      </div>

      <div className="mt-10 max-w-2xl space-y-6">
        <StatusBanner sender={sender} />

        <form onSubmit={save} className="rounded-2xl border border-hairline p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold">Business details</h2>
            <p className="mt-1.5 text-[14px] text-[#6E6A63]">
              Use your real, legal business information — the carriers verify it against public records.
            </p>
          </div>

          <div>
            <label className="eyebrow mb-2 block">Legal business name</label>
            <input className={input} value={biz.legalName} onChange={set('legalName')} disabled={!editable} required />
          </div>

          <div>
            <label className="eyebrow mb-2 block">Website</label>
            <input className={input} value={biz.website} onChange={set('website')} disabled={!editable} placeholder="https://…" required />
          </div>

          <div>
            <label className="eyebrow mb-2 block">Street address</label>
            <input className={input} value={biz.addressStreet} onChange={set('addressStreet')} disabled={!editable} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow mb-2 block">Contact first name</label>
              <input className={input} value={biz.contactFirstName} onChange={set('contactFirstName')} disabled={!editable} required />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Contact last name</label>
              <input className={input} value={biz.contactLastName} onChange={set('contactLastName')} disabled={!editable} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow mb-2 block">Contact email</label>
              <input type="email" className={input} value={biz.contactEmail} onChange={set('contactEmail')} disabled={!editable} required />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Contact phone</label>
              <input className={input} value={biz.contactPhone} onChange={set('contactPhone')} disabled={!editable} placeholder="+1…" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow mb-2 block">How clients opt in</label>
              <select className={input} value={biz.optInType} onChange={set('optInType')} disabled={!editable}>
                {OPT_IN_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="eyebrow mb-2 block">Texts per month (estimate)</label>
              <select className={input} value={biz.monthlyVolume} onChange={set('monthlyVolume')} disabled={!editable}>
                {VOLUMES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="eyebrow mb-2 block">Describe how clients consent to texts</label>
            <textarea className={`${input} min-h-[90px]`} value={biz.optInDetails} onChange={set('optInDetails')} disabled={!editable} required />
          </div>

          <div>
            <label className="eyebrow mb-2 block">Sample reminder message</label>
            <textarea className={`${input} min-h-[80px]`} value={biz.messageSample} onChange={set('messageSample')} disabled={!editable} required />
          </div>

          {editable ? (
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-ink px-6 py-2.5 text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save business details'}
            </button>
          ) : (
            <p className="text-[13px] text-[#6E6A63]">
              Your details are locked while verification is in progress. Need a change? Email{' '}
              <a href="mailto:support@sessionremind.com" className="text-accent underline">
                support@sessionremind.com
              </a>
              .
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
