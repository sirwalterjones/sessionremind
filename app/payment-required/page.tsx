'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCardIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/Notifications'
import { PLANS } from '@/lib/plans'

export default function PaymentRequiredPage() {
  // useSearchParams must be inside a Suspense boundary (Next.js 14 requirement).
  return (
    <Suspense fallback={null}>
      <PaymentRequiredContent />
    </Suspense>
  )
}

// sessionStorage key that carries the user's original destination across the
// Stripe checkout round-trip (checkout now returns to this page so we can
// confirm the subscription before routing).
const POST_CHECKOUT_REDIRECT_KEY = 'sr-post-checkout-redirect'

function PaymentRequiredContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  const paymentStatus = searchParams.get('payment')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const toast = useToast()

  useEffect(() => {
    fetchUserInfo()
  }, [])

  // ?payment=success — Stripe sent the user back here after checkout. Poll
  // /api/auth/me until the webhook has recorded the subscription (it also
  // clears the middleware payment gate), then route: new subscribers who
  // haven't connected UseSession yet go to the /welcome wizard; already-
  // connected users continue to their original destination exactly as before.
  useEffect(() => {
    if (paymentStatus !== 'success') return
    let finished = false

    const finish = async () => {
      if (finished) return
      finished = true
      // Recover the destination stashed before redirecting to Stripe.
      let dest = '/dashboard'
      try {
        const stored = sessionStorage.getItem(POST_CHECKOUT_REDIRECT_KEY)
        if (stored && stored.startsWith('/') && !stored.startsWith('/payment-required')) {
          dest = stored
        }
        sessionStorage.removeItem(POST_CHECKOUT_REDIRECT_KEY)
      } catch {
        /* sessionStorage unavailable — fall back to /dashboard */
      }
      let connected = false
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          connected = Boolean(data?.settings?.usesession?.connected)
        }
      } catch {
        /* treat as not connected — the wizard handles it gracefully */
      }
      // Same landing as before for connected users (?payment=success preserved);
      // everyone else gets the guided setup wizard.
      router.replace(connected ? `${dest}?payment=success` : '/welcome')
    }

    let tries = 0
    const interval = setInterval(async () => {
      tries++
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          const u = data?.user
          // Mirrors the server-side eligibility gate: a real Stripe sub id is
          // only set by the signature-verified webhook.
          if (u && (u.stripe_subscription_id || u.payment_override || u.is_admin)) {
            clearInterval(interval)
            await finish()
            return
          }
        }
      } catch {
        /* transient — keep polling */
      }
      if (tries >= 30) {
        // ~60s: webhook is unusually slow — proceed anyway rather than strand
        // the user; downstream pages re-check entitlements themselves.
        clearInterval(interval)
        await finish()
      }
    }, 2000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus])

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

  const handlePayment = async (plan: string) => {
    setIsLoading(true)
    try {
      // Stash the real destination, then have Stripe return to THIS page
      // (?payment=success gets appended by create-checkout) so we can confirm
      // the subscription and route new subscribers into the /welcome wizard.
      try {
        if (!redirectPath.startsWith('/payment-required')) {
          sessionStorage.setItem(POST_CHECKOUT_REDIRECT_KEY, redirectPath)
        }
      } catch {
        /* sessionStorage unavailable — success handler falls back to /dashboard */
      }
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectPath: '/payment-required',
          plan,
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

  // Post-checkout confirmation state (the effect above routes onward).
  if (paymentStatus === 'success') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
        <div className="eyebrow flex items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#16a34a' }} />
          Payment received
        </div>
        <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05] text-ink">
          Thank you.
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
          Confirming your subscription — this only takes a moment&hellip;
        </p>
        <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.16em] text-faint animate-pulse">
          Setting things up
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--c-accent))' }} />
            Access restricted
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.05]">
            Payment required
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Your account requires payment to access SessionRemind features.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {user && (
            <div className="flex items-center gap-3 rounded-2xl border border-hairline p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                <span className="text-sm font-medium text-accent-ink">
                  {user.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  {user.username}
                </p>
                <p className="text-sm text-muted">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-hairline bg-panel p-5">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Access restricted
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  A paid subscription is required to use SessionRemind. Choose a
                  plan below to continue — you can manage or cancel anytime from
                  your profile.
                </p>
              </div>
            </div>
          </div>

          {/* Plan picker */}
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div key={plan.key} className="flex flex-col rounded-2xl border border-hairline p-6">
                <div className="eyebrow mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-semibold text-ink">${plan.price}</span>
                  <span className="text-sm text-muted">/ mo</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {plan.includedTexts.toLocaleString()} texts/mo included · then ${plan.overage.toFixed(2)}/text
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[14px] text-ink">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePayment(plan.key)}
                  disabled={isLoading}
                  className="mt-5 w-full rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Processing…' : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-faint">
          Questions? Email support@sessionremind.com.
        </p>
      </div>
    </div>
  )
} 