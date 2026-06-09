'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCardIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/Notifications'

export default function PaymentRequiredPage() {
  // useSearchParams must be inside a Suspense boundary (Next.js 14 requirement).
  return (
    <Suspense fallback={null}>
      <PaymentRequiredContent />
    </Suspense>
  )
}

function PaymentRequiredContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const toast = useToast()

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectPath: redirectPath
        })
      })

      const data = await response.json()
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to initiate payment process')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#DD4D24' }} />
            Access restricted
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">
            Payment required
          </h1>
          <p className="mt-3 text-[15px] text-[#6E6A63]">
            Your account requires payment to access SessionRemind features.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-hairline p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ink">
                <span className="text-sm font-medium text-white">
                  {user.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  {user.username}
                </p>
                <p className="text-sm text-[#6E6A63]">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-hairline bg-[#FAFAF8] p-5">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Access restricted
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#6E6A63]">
                  Your administrator has required payment for your account.
                  Please complete payment to access SessionRemind features.
                </p>
              </div>
            </div>
          </div>

          {/* Professional Plan Details */}
          <div className="rounded-2xl border border-hairline p-8">
            <div className="text-center">
              <div className="eyebrow mb-4">Professional · everything included</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-5xl font-semibold text-ink">$20</span>
                <span className="text-[#6E6A63]">/ month</span>
              </div>
              <p className="mt-3 text-sm text-[#6E6A63]">
                Everything you need for session management.
              </p>
            </div>

            <ul className="mt-8 space-y-4">
              {[
                '500 SMS messages per month',
                'Automated session reminders',
                'Custom message templates',
                'Usage analytics',
                'Priority support',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[15px] text-ink">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="mt-8 flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CreditCardIcon className="mr-2 h-5 w-5" />
                  Subscribe now
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[#6E6A63] underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
          Questions? Contact your administrator for assistance.
        </p>
      </div>
    </div>
  )
} 