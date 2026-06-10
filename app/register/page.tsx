'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Turnstile from '@/components/Turnstile'

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const A = '#DD4D24' // accent

const STEPS: Array<[string, string, string]> = [
  ['01', 'Create your account', 'Username, email, password — this page, right now.'],
  ['02', 'Pick a plan & connect', 'Link your UseSession calendar in about a minute.'],
  ['03', 'Reminders run themselves', 'Clients get texted 3 days and 1 day before every shoot.'],
]

function NextSteps() {
  return (
    <div className="rounded-2xl border border-hairline bg-white">
      <div className="border-b border-hairline px-5 py-3">
        <span className="eyebrow">What happens next</span>
      </div>
      <div className="divide-y divide-hairline">
        {STEPS.map(([n, title, blurb]) => (
          <div key={n} className="flex gap-4 px-5 py-4">
            <span className="font-mono text-[11px] leading-6 tracking-[0.14em]" style={{ color: A }}>
              {n}
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight">{title}</div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-[#8A857C]">{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrustRow() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
      <span>AES-256 encrypted</span>
      <span className="hidden h-3 w-px bg-hairline sm:inline-block" />
      <span>Your data, never touched</span>
      <span className="hidden h-3 w-px bg-hairline sm:inline-block" />
      <span>Cancel anytime</span>
    </div>
  )
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Please complete the verification challenge below.')
      return
    }

    setLoading(true)

    const result = await register(username, email, password, turnstileToken)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  const input =
    'w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-[15px] placeholder:text-[#B5B0A8] transition-colors focus:border-ink focus:outline-none'

  return (
    <div className="-mt-6 sm:-mt-10 text-ink">
      <section className="full-bleed relative bg-white">
        <div className="grid-lines absolute inset-0 h-[420px]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16">
            {/* ── Left: the pitch ── */}
            <div>
              <div className="rise eyebrow flex items-center gap-2" style={{ animationDelay: '0.04s' }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: A }} />
                Plans from $15/mo · cancel anytime
              </div>

              <h1
                className="rise font-display mt-6 text-[2.9rem] font-semibold leading-[0.95] sm:text-6xl lg:text-[4.2rem]"
                style={{ animationDelay: '0.1s' }}
              >
                Set it up once.
                <br />
                <span style={{ color: A }}>Never chase again.</span>
              </h1>

              <p
                className="rise mt-6 max-w-md text-lg leading-relaxed text-[#4F4B44]"
                style={{ animationDelay: '0.18s' }}
              >
                Create your account, connect UseSession, and every client gets a perfectly-timed
                text before their shoot — automatically.
              </p>

              <div className="rise mt-10 hidden lg:block" style={{ animationDelay: '0.26s' }}>
                <NextSteps />
              </div>

              {/* floating text bubble — same motif as the homepage hero */}
              <div
                className="rise mt-10 hidden w-64 -rotate-2 rounded-2xl bg-ink p-4 text-white shadow-xl lg:block"
                style={{ animationDelay: '0.34s' }}
              >
                <p className="text-[13px] leading-snug">
                  Hi Maria! Reminder — your Senior Session is tomorrow at 4 PM. See you there! 📸
                </p>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">
                  Sent automatically
                </div>
              </div>

              <div className="rise mt-10 hidden lg:block" style={{ animationDelay: '0.4s' }}>
                <TrustRow />
              </div>
            </div>

            {/* ── Right: the form, styled like the hero product panel ── */}
            <div className="rise" style={{ animationDelay: '0.22s' }}>
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between border-b border-hairline px-6 py-4 sm:px-8">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: A }} />
                    <span className="text-sm font-semibold tracking-tight">Create your account</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A958C]">
                    ~60 sec
                  </span>
                </div>

                <form className="space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="username" className="eyebrow mb-2 block">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={input}
                      placeholder="yourstudio"
                    />
                  </div>

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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="eyebrow mb-2 block">
                        Password
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
                        placeholder="6+ characters"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="eyebrow mb-2 block">
                        Confirm
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
                      'Creating account…'
                    ) : (
                      <>
                        Create account
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-[#6E6A63]">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-medium text-ink underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* ── Mobile: steps + trust below the form ── */}
          <div className="mt-12 space-y-8 lg:hidden">
            <NextSteps />
            <TrustRow />
          </div>
        </div>
      </section>
    </div>
  )
}
