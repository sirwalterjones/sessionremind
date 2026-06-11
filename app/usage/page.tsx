'use client'

import { useAuth } from '@/lib/auth-context'
import SmsUsage from '@/components/SmsUsage'

export default function UsagePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-10 w-1/3 rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card p-6">
              <div className="mb-3 h-3 w-20 rounded bg-white/10" />
              <div className="h-8 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink">
        <div className="w-full max-w-sm rounded-2xl border border-hairline bg-card p-10 text-center">
          <p className="eyebrow mb-3">Restricted</p>
          <h1 className="font-display text-3xl font-semibold">Please sign in</h1>
          <p className="mt-2 text-muted">Log in to view your SMS usage.</p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink transition-shadow hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)]"
          >
            Go to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="flex flex-col gap-5 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Usage</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your SMS usage</h1>
          <p className="mt-2 text-muted">Track your SMS analytics, delivery, and remaining monthly limit.</p>
        </div>
        <span className="rounded-full border border-hairline px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Professional Plan
        </span>
      </header>

      <div className="mt-8">
        <SmsUsage userId={user.id} />
      </div>
    </>
  )
}
