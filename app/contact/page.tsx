'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Turnstile from '@/components/Turnstile'

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const TOPICS = [
  { value: 'support', label: 'I need help with something' },
  { value: 'billing', label: 'Billing question' },
  { value: 'bug', label: 'Something looks broken' },
  { value: 'general', label: 'General / anything else' },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('support')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Prefill from the logged-in account when there is one.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setName((v) => v || d.user.username || '')
          setEmail((v) => v || d.user.email || '')
        }
      })
      .catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the verification challenge below.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong — please try again.')
    } finally {
      setSending(false)
    }
  }

  const input =
    'w-full rounded-lg bg-card border border-hairline px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40'

  if (sent) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-ink">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-accent" />
        <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">Got it.</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Thanks{name ? `, ${name.split(' ')[0]}` : ''} — your message is in. We&apos;ll reply to{' '}
          <span className="font-medium text-ink">{email}</span>, usually within one business day.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink transition-all hover:shadow-glow"
          >
            Back home
          </Link>
          <Link
            href="/help"
            className="rounded-full border border-hairline px-6 py-2.5 font-medium text-ink transition-colors hover:bg-ink/5"
          >
            Browse help docs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl py-10 text-ink">
      <div className="text-center">
        <div className="eyebrow flex items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          We reply within a business day
        </div>
        <h1 className="font-display mt-5 text-4xl sm:text-5xl font-semibold leading-[1.05]">
          Talk to a human.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Questions, billing, a bug, an idea — send it over. Quick answers may already be in the{' '}
          <Link href="/faq" className="text-accent underline">
            FAQ
          </Link>{' '}
          or the{' '}
          <Link href="/help" className="text-accent underline">
            help docs
          </Link>
          .
        </p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-5 rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow mb-2 block">Your name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="eyebrow mb-2 block">Email</label>
            <input
              type="email"
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="eyebrow mb-2 block">What&apos;s this about?</label>
          <select className={input} value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="eyebrow mb-2 block">Message</label>
          <textarea
            className={`${input} min-h-[140px]`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="The more detail, the faster we can help."
            required
          />
        </div>

        <Turnstile onVerify={setTurnstileToken} />

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || (TURNSTILE_ENABLED && !turnstileToken)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EnvelopeIcon className="h-5 w-5" />
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
