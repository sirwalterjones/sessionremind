'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/Notifications'

function VerifyEmailContent() {
  const params = useSearchParams()
  const status = params.get('status')
  const { user } = useAuth()
  const toast = useToast()
  const [sending, setSending] = useState(false)

  const resend = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      if (data.alreadyVerified) toast.success('Your email is already verified.')
      else toast.success('Verification email sent — check your inbox.')
    } catch (e: any) {
      toast.error(`Could not resend: ${e?.message || e}`)
    } finally {
      setSending(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#16a34a] text-2xl text-white">
          ✓
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">Email verified</h1>
        <p className="mt-3 text-[15px] text-muted">You&apos;re all set.</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:shadow-glow transition-all"
        >
          Go to dashboard
        </Link>
      </div>
    )
  }

  const expired = status === 'expired'
  return (
    <div className="text-center">
      <div className="eyebrow flex items-center justify-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--c-accent))' }} />
        {expired ? 'Link expired' : 'One more step'}
      </div>
      <h1 className="font-display mt-5 text-3xl font-semibold leading-[1.05]">
        {expired ? 'That link expired' : 'Verify your email'}
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        {expired
          ? 'Verification links last 24 hours. Send yourself a fresh one below.'
          : user?.email
          ? `We sent a verification link to ${user.email}. Click it to finish setting up your account.`
          : 'We sent you a verification link. Click it to finish setting up your account.'}
      </p>
      <button
        onClick={resend}
        disabled={sending}
        className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:shadow-glow transition-all disabled:opacity-50"
      >
        {sending ? 'Sending…' : 'Resend verification email'}
      </button>
      <p className="mt-4 text-xs text-muted">
        Already verified?{' '}
        <Link href="/dashboard" className="text-accent underline">
          Continue
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-center text-sm text-muted">Loading…</p>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
