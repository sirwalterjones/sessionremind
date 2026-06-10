'use client'

import { useState } from 'react'
import Link from 'next/link'
import Turnstile from '@/components/Turnstile'

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const A = '#DD4D24' // accent

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the verification challenge below.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
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

  if (sent) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-ink">
        <div className="eyebrow flex items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: A }} />
          Check your inbox
        </div>
        <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">On its way.</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#6E6A63]">
          If an account exists for <span className="font-medium text-ink">{email}</span>, a reset
          link is on its way. It expires in 1 hour — check spam if it doesn&apos;t show up in a
          minute or two.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-ink px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] items-start justify-center py-12 text-ink">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: A }} />
            It happens to everyone
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">
            Forgot your password?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6E6A63]">
            Enter the email you signed up with and we&apos;ll send a link to choose a new one.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-hairline bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)] sm:p-8"
        >
          <div>
            <label htmlFor="email" className="eyebrow mb-2 block">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-[15px] placeholder:text-[#B5B0A8] transition-colors focus:border-ink focus:outline-none"
              placeholder="you@yourstudio.com"
            />
          </div>

          <Turnstile onVerify={setTurnstileToken} />

          {error && (
            <div className="rounded-lg border border-hairline bg-[#FAFAF8] px-4 py-3 text-sm text-accent">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || (TURNSTILE_ENABLED && !turnstileToken)}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {sending ? (
              'Sending link…'
            ) : (
              <>
                Email me a reset link
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-[#6E6A63]">
            Remembered it?{' '}
            <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
