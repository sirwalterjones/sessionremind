'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileNav from '@/components/MobileNav'
import NavLinks from '@/components/NavLinks'
import AppShell from '@/components/AppShell'

// Site chrome. Signed-in app pages render inside the sidebar AppShell; the
// marketing/auth pages (visible logged-out) keep the top nav + footer.
// NOTE: /admin has its own console chrome and is intentionally not shelled.
const APP_SHELL_ROUTES = ['/dashboard', '/usage', '/reminders', '/connect', '/new', '/profile']

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppShell = APP_SHELL_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + '/'))
  // The homepage is the darkroom — its chrome flips to the warm-black palette.
  const dark = pathname === '/'

  if (isAppShell) {
    // Wrap the page in the sidebar shell so every app page shares one chrome.
    return (
      <div className="min-h-screen bg-white text-[#141414]">
        <AppShell>{children}</AppShell>
      </div>
    )
  }

  return (
    <div className={dark ? 'min-h-screen bg-[#0D0B09] text-[#EFEAE0]' : 'min-h-screen bg-white text-[#141414]'}>
      <nav
        className={`sticky top-0 z-50 backdrop-blur border-b ${
          dark ? 'bg-[#0D0B09]/80 border-white/10' : 'bg-white/85 border-[#ECEAE4]'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white text-[16px] font-bold tracking-tight transition-transform group-hover:scale-105"
                style={{ background: dark ? '#DD4D24' : '#141414' }}
              >
                Sr
              </span>
              <span
                className={`text-[21px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-[#141414]'}`}
              >
                SessionRemind
              </span>
            </Link>

            <NavLinks dark={dark} />
            <MobileNav dark={dark} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-6 px-5 sm:py-10 sm:px-8">{children}</main>

      <footer className={`border-t mt-auto ${dark ? 'border-white/10' : 'border-[#ECEAE4]'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-[14px] font-bold tracking-tight"
                style={{ background: dark ? '#DD4D24' : '#141414' }}
              >
                Sr
              </span>
              <span className="text-base font-semibold tracking-tight">SessionRemind</span>
            </div>
            <nav
              className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] ${
                dark ? 'text-[#9C9484]' : 'text-[#6E6A63]'
              }`}
            >
              <Link href="/help" className={dark ? 'hover:text-white transition-colors' : 'hover:text-[#141414] transition-colors'}>Help</Link>
              <Link href="/faq" className={dark ? 'hover:text-white transition-colors' : 'hover:text-[#141414] transition-colors'}>FAQ</Link>
              <Link href="/contact" className={dark ? 'hover:text-white transition-colors' : 'hover:text-[#141414] transition-colors'}>Contact</Link>
              <Link href="/privacy" className={dark ? 'hover:text-white transition-colors' : 'hover:text-[#141414] transition-colors'}>Privacy</Link>
              <Link href="/sms-opt-in" className={dark ? 'hover:text-white transition-colors' : 'hover:text-[#141414] transition-colors'}>SMS terms</Link>
            </nav>
          </div>
          <div className="text-center sm:text-right">
            <p className={`font-mono text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-[#8A8273]' : 'text-[#9A958C]'}`}>
              SMS &amp; E-mail Reminders for Sessions
            </p>
            <p className={`font-mono text-[10px] uppercase tracking-[0.14em] mt-1 ${dark ? 'text-[#6F6759]' : 'text-[#B5B0A8]'}`}>
              Not affiliated with Session Technologies, LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
