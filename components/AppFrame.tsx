'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import NavLinks from '@/components/NavLinks'

// Site chrome (top nav + footer). The signed-in dashboard renders its own
// full-screen sidebar shell, so we suppress the marketing chrome there.
const APP_SHELL_ROUTES = ['/dashboard']

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppShell = APP_SHELL_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + '/'))

  if (isAppShell) {
    // The page owns the entire viewport chrome (see app/dashboard).
    return <div className="min-h-screen bg-white text-[#141414]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-white text-[#141414]">
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-[#ECEAE4]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white text-[16px] font-bold tracking-tight transition-transform group-hover:scale-105"
                style={{ background: '#141414' }}
              >
                Sr
              </span>
              <span className="text-[21px] font-semibold tracking-tight text-[#141414]">SessionRemind</span>
            </Link>

            <NavLinks />
            <MobileNav />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-6 px-5 sm:py-10 sm:px-8">{children}</main>

      <footer className="border-t border-[#ECEAE4] mt-auto">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-[14px] font-bold tracking-tight"
                style={{ background: '#141414' }}
              >
                Sr
              </span>
              <span className="text-base font-semibold tracking-tight">SessionRemind</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-[#6E6A63]">
              <Link href="/help" className="hover:text-[#141414] transition-colors">Help</Link>
              <Link href="/faq" className="hover:text-[#141414] transition-colors">FAQ</Link>
              <Link href="/contact" className="hover:text-[#141414] transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-[#141414] transition-colors">Privacy</Link>
              <Link href="/sms-opt-in" className="hover:text-[#141414] transition-colors">SMS terms</Link>
            </nav>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9A958C]">
              SMS &amp; E-mail Reminders for Sessions
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B5B0A8] mt-1">
              Not affiliated with Session Technologies, LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
