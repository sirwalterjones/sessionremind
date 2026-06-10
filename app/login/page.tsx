'use client'

import { useState, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Turnstile from '@/components/Turnstile'

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const A = '#DD4D24' // accent

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the verification challenge below.')
      return
    }
    setLoading(true)

    try {
      const result = await login(email, password, turnstileToken)

      if (result.success) {
        // Force a full page reload to ensure cookies are set
        setTimeout(() => {
          const redirect = searchParams.get('redirect') || '/dashboard'
          window.location.href = redirect
        }, 500)
      } else {
        setError(result.error || 'Login failed')
        setLoading(false)
      }
    } catch (error) {
      setError('Login failed')
      setLoading(false)
    }
  }

  const input =
    'w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-[15px] placeholder:text-[#B5B0A8] transition-colors focus:border-ink focus:outline-none'

  return (
    <div className="-mt-6 sm:-mt-10 text-ink">
      <section className="full-bleed relative bg-white">
        <div className="grid-lines absolute inset-0 h-[420px]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-16">
            {/* ── Left: welcome back ── */}
            <div>
              <div className="rise eyebrow flex items-center gap-2" style={{ animationDelay: '0.04s' }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: A }} />
                Welcome back
              </div>

              <h1
                className="rise font-display mt-6 text-[2.9rem] font-semibold leading-[0.95] sm:text-6xl lg:text-[4.2rem]"
                style={{ animationDelay: '0.1s' }}
              >
                Your reminders
                <br />
                <span style={{ color: A }}>never stopped.</span>
              </h1>

              <p
                className="rise mt-6 max-w-md text-lg leading-relaxed text-[#4F4B44]"
                style={{ animationDelay: '0.18s' }}
              >
                Sign in to see what&apos;s scheduled, tune your templates, and watch the texts go
                out without you.
              </p>

              {/* floating text bubble — same motif as the homepage hero */}
              <div
                className="rise mt-12 hidden w-64 -rotate-2 rounded-2xl bg-ink p-4 text-white shadow-xl lg:block"
                style={{ animationDelay: '0.28s' }}
              >
                <p className="text-[13px] leading-snug">
                  Hi Kayla! Reminder about your Watermelon Mini tomorrow at 2 PM. See you then! 📸
                </p>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">
                  Sent while you were out
                </div>
              </div>

              <div
                className="rise mt-12 hidden flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C] lg:flex"
                style={{ animationDelay: '0.34s' }}
              >
                <span>AES-256 encrypted</span>
                <span className="h-3 w-px bg-hairline" />
                <span>Your data, never touched</span>
                <span className="h-3 w-px bg-hairline" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* ── Right: sign-in card ── */}
            <div className="rise" style={{ animationDelay: '0.22s' }}>
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between border-b border-hairline px-6 py-4 sm:px-8">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: A }} />
                    <span className="text-sm font-semibold tracking-tight">Sign in</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A958C]">
                    Welcome back
                  </span>
                </div>

                <form className="space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
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
                      className={input}
                      placeholder="you@yourstudio.com"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label htmlFor="password" className="eyebrow block">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-[#6E6A63] underline-offset-4 hover:text-ink hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={input}
                      placeholder="Your password"
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
                    disabled={loading || (TURNSTILE_ENABLED && !turnstileToken)}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      'Signing in…'
                    ) : (
                      <>
                        Sign in
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-[#6E6A63]">
                    New here?{' '}
                    <Link
                      href="/register"
                      className="font-medium text-ink underline-offset-4 hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center py-12">
          <div className="w-full max-w-sm text-center">
            <div className="eyebrow flex items-center justify-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#DD4D24' }} />
              Welcome back
            </div>
            <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">Loading…</h1>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
