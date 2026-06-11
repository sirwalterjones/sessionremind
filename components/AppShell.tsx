'use client'

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
} from '@heroicons/react/24/outline'

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
  // Longest-prefix match so e.g. /new/foo still highlights "New reminder".
  const activeHref =
    WORKSPACE.map((w) => w.href)
      .filter((href) => pathname === href || pathname.startsWith(href + '/'))
      .sort((a, b) => b.length - a.length)[0] || ''

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* ───────── Sidebar ───────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-panel lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-hairline">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[15px] font-bold tracking-tight"
            style={{ background: '#C6F24E', color: '#11130A' }}
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
                    ? 'bg-card text-accent border border-accent/30 shadow-[inset_2px_0_0_0_#C6F24E]'
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
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {user?.is_admin ? 'Admin' : 'Professional'}
              </p>
            </div>
            <button
              onClick={logout}
              aria-label="Log out"
              className="rounded-lg border border-hairline bg-card p-2 text-ink transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ───────── Main column ───────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar (sidebar is hidden < lg) */}
        <div className="flex items-center justify-between border-b border-hairline px-5 h-16 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[14px] font-bold tracking-tight"
              style={{ background: '#C6F24E', color: '#11130A' }}
            >
              Sr
            </span>
            <span className="text-base font-semibold tracking-tight">SessionRemind</span>
          </Link>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <Link href="/reminders" className="rounded-full border border-hairline px-3 py-1 text-ink">Reminders</Link>
            <Link href="/usage" className="rounded-full border border-hairline px-3 py-1 text-ink">Usage</Link>
            <button onClick={logout} className="rounded-full border border-hairline px-3 py-1 text-ink">
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
