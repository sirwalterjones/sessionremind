'use client'

import { useState, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      
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

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#DD4D24' }} />
            Welcome back
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">
            Sign in
          </h1>
          <p className="mt-3 text-[15px] text-[#6E6A63]">
            Access your SMS reminder dashboard.
          </p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
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
                className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-hairline bg-[#FAFAF8] px-4 py-3 text-sm text-accent">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-6 py-3 text-center font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in... Please wait' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-[#6E6A63]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-ink underline-offset-4 hover:underline">
              Sign up now
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-sm text-center">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#DD4D24' }} />
            Welcome back
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">
            Loading…
          </h1>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}