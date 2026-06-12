'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import MobileNav from '@/components/MobileNav'
import NavLinks from '@/components/NavLinks'
import AppShell from '@/components/AppShell'
import ThemeToggle from '@/components/ThemeToggle'

// Site chrome — Ink & Acid graphite, everywhere. App pages always render in
// the sidebar AppShell. Signed-in visitors ALSO get the shell on content pages
// (instructions, help, faq, contact, …) so following a sidebar link never
// kicks them out of the app. Signed-out visitors get the top nav + footer.
// NOTE: /admin has its own console chrome and is intentionally not shelled.
const APP_SHELL_ROUTES = ['/dashboard', '/usage', '/reminders', '/connect', '/new', '/profile']
// Never shelled, even when signed in: the marketing front door, the auth
// flow, and the payment wall. (The admin console DOES load in the shell —
// its own header renders inside the content column.)
const NO_SHELL_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/payment-required',
]

function SrTile({ size = 9 }: { size?: 8 | 9 }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-accent font-bold tracking-tight text-accent-ink ${
        size === 9 ? 'w-9 h-9 text-[16px]' : 'w-8 h-8 text-[14px]'
      }`}
    >
      Sr
    </span>
  )
}

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const isAppRoute = APP_SHELL_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + '/'))
  const neverShell = NO_SHELL_ROUTES.includes(pathname || '')
  // App routes are always shelled (they're auth-gated by middleware anyway);
  // other pages join the shell once we know the visitor is signed in.
  const isAppShell = isAppRoute || (!neverShell && !loading && !!user)

  if (isAppShell) {
    // Wrap the page in the sidebar shell so every app page shares one chrome.
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <AppShell>{children}</AppShell>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="sticky top-0 z-50 bg-canvas/80 backdrop-blur border-b border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="transition-transform group-hover:scale-105">
                <SrTile />
              </span>
              <span className="text-[21px] font-semibold tracking-tight text-ink">SessionRemind</span>
            </Link>

            <div className="flex items-center gap-2">
              <NavLinks />
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-6 px-5 sm:py-10 sm:px-8">{children}</main>

      <footer className="border-t border-hairline mt-auto">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="flex items-center gap-3">
              <SrTile size={8} />
              <span className="text-base font-semibold tracking-tight">SessionRemind</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[14px] text-muted">
              <Link href="/help" className="hover:text-ink transition-colors">Help</Link>
              <Link href="/faq" className="hover:text-ink transition-colors">FAQ</Link>
              <Link href="/contact" className="hover:text-ink transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
              <Link href="/sms-opt-in" className="hover:text-ink transition-colors">SMS terms</Link>
            </nav>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
              SMS &amp; E-mail Reminders for Sessions
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint mt-1">
              Not affiliated with Session Technologies, LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
