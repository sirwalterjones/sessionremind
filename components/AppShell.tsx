'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  Squares2X2Icon,
  BellIcon,
  LinkIcon,
  PlusIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import ThemeToggle from '@/components/ThemeToggle'

const WORKSPACE = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { key: 'reminders', label: 'Reminders', href: '/reminders', icon: BellIcon },
  { key: 'connect', label: 'Connect', href: '/connect', icon: LinkIcon },
  { key: 'new', label: 'New reminder', href: '/new', icon: PlusIcon },
  { key: 'usage', label: 'Usage', href: '/usage', icon: ChartBarIcon },
  { key: 'profile', label: 'Profile', href: '/profile', icon: UserCircleIcon },
]

const RESOURCES = [
  { label: 'How it works', href: '/instructions', icon: QuestionMarkCircleIcon },
  { label: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
]

// Signed-in app shell: left sidebar (collapses to a top bar on mobile) plus a
// scrollable content column. The active nav item is derived from the URL.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname() || ''
  const [menuOpen, setMenuOpen] = useState(false)
  // Longest-prefix match so e.g. /new/foo still highlights "New reminder".
  const activeHref =
    WORKSPACE.map((w) => w.href)
      .filter((href) => pathname === href || pathname.startsWith(href + '/'))
      .sort((a, b) => b.length - a.length)[0] || ''

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* ───────── Sidebar ───────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-panel lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-hairline">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-[15px] font-bold tracking-tight text-accent-ink"
          >
            Sr
          </span>
          <span className="text-[17px] font-semibold tracking-tight">SessionRemind</span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="eyebrow px-2 pb-2">Workspace</p>
          <div className="space-y-1">
            {WORKSPACE.map(({ key, label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  href === activeHref
                    ? 'bg-card text-accent border border-accent/30 shadow-[inset_2px_0_0_0_rgb(var(--c-accent))]'
                    : 'text-muted hover:bg-card hover:text-ink'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            ))}
          </div>

          <p className="eyebrow px-2 pb-2 pt-6">Resources</p>
          <div className="space-y-1">
            {RESOURCES.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-ink"
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            ))}
            {user?.is_admin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-card hover:text-ink"
              >
                <Cog6ToothIcon className="h-[18px] w-[18px]" />
                Admin Console
              </Link>
            )}
          </div>
        </nav>

        <div className="border-t border-hairline p-3">
          <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user?.username}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                {user?.is_admin ? 'Admin' : 'Professional'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={logout}
                aria-label="Log out"
                className="rounded-lg border border-hairline bg-card p-2 text-ink transition-colors hover:border-accent/40 hover:text-accent"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ───────── Main column ───────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (sidebar is hidden < lg) */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-hairline bg-canvas/90 px-5 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[14px] font-bold tracking-tight text-accent-ink"
            >
              Sr
            </span>
            <span className="text-base font-semibold tracking-tight">SessionRemind</span>
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-hairline bg-card p-2 text-ink"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile slide-over menu — portaled to <body> so no ancestor
            (sticky/backdrop-blur creates a containing block) can trap the
            fixed overlay. */}
        {menuOpen &&
          createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="sr-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="sr-sheet-in absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col border-l border-hairline bg-canvas shadow-2xl">
              <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[14px] font-bold tracking-tight text-accent-ink">
                    Sr
                  </span>
                  <span className="text-base font-semibold tracking-tight">SessionRemind</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg border border-hairline bg-card p-2 text-ink"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-5">
                <p className="eyebrow px-3 pb-2">Workspace</p>
                <div className="space-y-1">
                  {WORKSPACE.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[16px] font-medium transition-colors ${
                        href === activeHref
                          ? 'bg-card text-accent border border-accent/30'
                          : 'text-ink hover:bg-card'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}
                </div>

                <p className="eyebrow px-3 pb-2 pt-6">Resources</p>
                <div className="space-y-1">
                  {RESOURCES.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[16px] font-medium text-ink transition-colors hover:bg-card"
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}
                  {user?.is_admin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[16px] font-medium text-ink transition-colors hover:bg-card"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      Admin Console
                    </Link>
                  )}
                </div>
              </nav>

              <div className="border-t border-hairline p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">{user?.username}</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                      {user?.is_admin ? 'Admin' : 'Professional'}
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                <button
                  onClick={logout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-card px-4 py-3 text-[15px] font-medium text-ink transition-colors hover:border-accent/40"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Log out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        <div className="flex-1 px-5 py-8 sm:px-8">
          <div className="shell-scope mx-auto w-full max-w-[1500px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
