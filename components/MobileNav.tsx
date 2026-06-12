'use client'

// Mobile menu for the marketing/site nav: a right-hand slide-over sheet with
// big tap targets, a dimmed backdrop, scroll-lock, and a clear CTA. The
// signed-in app pages get the matching sheet in AppShell.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  Bars3Icon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

const PUBLIC_LINKS = [
  { label: 'How it works', href: '/instructions', icon: SparklesIcon },
  { label: 'Help & docs', href: '/help', icon: BookOpenIcon },
  { label: 'FAQ', href: '/faq', icon: QuestionMarkCircleIcon },
  { label: 'Contact', href: '/contact', icon: ChatBubbleLeftRightIcon },
]

export default function MobileNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname() || ''
  const [isOpen, setIsOpen] = useState(false)

  // Close on navigation; lock background scroll while open.
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
  }

  const row = (active: boolean) =>
    `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[16px] font-medium transition-colors ${
      active ? 'bg-card text-accent border border-accent/30' : 'text-ink hover:bg-card'
    }`

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="rounded-lg border border-hairline bg-card p-2 text-ink"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Portaled to <body>: the nav bar's backdrop-blur creates a containing
          block that would otherwise trap this fixed overlay inside the 64px
          bar instead of covering the viewport. */}
      {isOpen &&
        createPortal(
        <div className="fixed inset-0 z-[100]">
          <div
            className="sr-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="sr-sheet-in absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col border-l border-hairline bg-canvas shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
              <span className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[14px] font-bold tracking-tight text-accent-ink">
                  Sr
                </span>
                <span className="text-base font-semibold tracking-tight text-ink">
                  SessionRemind
                </span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="rounded-lg border border-hairline bg-card p-2 text-ink"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
              {user && (
                <>
                  <p className="eyebrow px-3 pb-2">Your studio</p>
                  <div className="mb-6 space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={row(pathname.startsWith('/dashboard'))}
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                      Open dashboard
                    </Link>
                  </div>
                </>
              )}

              <p className="eyebrow px-3 pb-2">Explore</p>
              <div className="space-y-1">
                {PUBLIC_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={row(pathname.startsWith(href))}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="border-t border-hairline p-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-card px-4 py-3 text-[15px] font-medium text-ink transition-colors hover:border-accent/40"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Log out
                </button>
              ) : (
                <div className="space-y-2.5">
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-accent-ink"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl border border-hairline bg-card px-4 py-3 text-[15px] font-medium text-ink"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
