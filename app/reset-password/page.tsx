'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const A = '#C6F24E' // accent

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/forgot-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong — please try again.')
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint transition-colors focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40'

  if (!token) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-ink">
        <h1 className="font-display text-4xl font-semibold leading-[1.05]">
          That link isn&apos;t right.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          This page needs the reset link from your email. If yours expired, request a fresh one —
          it only takes a second.
        </p>
        <div className="mt-8">
          <Link
            href="/forgot-password"
            className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink transition-all hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)]"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-ink">
        <div className="eyebrow flex items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: A }} />
          You&apos;re back in
        </div>
        <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">Password updated.</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Your new password is saved. Sign in and pick up where you left off.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink transition-all hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)]"
          >
            Sign in
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
            Almost there
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">
            Choose a new password.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Make it at least 8 characters — something you&apos;ll remember this time.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-hairline bg-card p-6 sm:p-8"
        >
          <div>
            <label htmlFor="password" className="eyebrow mb-2 block">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              placeholder="8+ characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="eyebrow mb-2 block">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={input}
              placeholder="Repeat it"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink transition-all hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {saving ? (
              'Saving…'
            ) : (
              <>
                Save new password
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center py-12">
          <div className="w-full max-w-sm text-center">
            <h1 className="font-display text-4xl font-semibold leading-[1.05]">Loading…</h1>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
