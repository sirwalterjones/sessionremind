'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import NavLinks from '@/components/NavLinks'
import AppShell from '@/components/AppShell'

// Site chrome — Ink & Acid graphite, everywhere. Signed-in app pages render
// inside the sidebar AppShell; marketing/auth pages keep the top nav + footer.
// NOTE: /admin has its own console chrome and is intentionally not shelled.
const APP_SHELL_ROUTES = ['/dashboard', '/usage', '/reminders', '/connect', '/new', '/profile']

function SrTile({ size = 9 }: { size?: 8 | 9 }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-bold tracking-tight ${
        size === 9 ? 'w-9 h-9 text-[16px]' : 'w-8 h-8 text-[14px]'
      }`}
      style={{ background: '#C6F24E', color: '#11130A' }}
    >
      Sr
    </span>
  )
}

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppShell = APP_SHELL_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + '/'))

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
      <nav className="sticky top-0 z-50 bg-[#101113]/80 backdrop-blur border-b border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="transition-transform group-hover:scale-105">
                <SrTile />
              </span>
              <span className="text-[21px] font-semibold tracking-tight text-ink">SessionRemind</span>
            </Link>

            <NavLinks />
            <MobileNav />
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
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-muted">
              <Link href="/help" className="hover:text-ink transition-colors">Help</Link>
              <Link href="/faq" className="hover:text-ink transition-colors">FAQ</Link>
              <Link href="/contact" className="hover:text-ink transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
              <Link href="/sms-opt-in" className="hover:text-ink transition-colors">SMS terms</Link>
            </nav>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              SMS &amp; E-mail Reminders for Sessions
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint mt-1">
              Not affiliated with Session Technologies, LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
