'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const item =
    'block px-5 py-3 text-[15px] font-medium text-muted hover:text-ink hover:bg-white/5 transition-colors'

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        className="p-2 text-ink"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-panel border-t border-hairline py-2">
          {/* Most-used destinations lead; Help and Profile sit at the end. */}
          {user && (
            <Link href="/dashboard" className={item} onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          )}
          {user && (
            <Link href="/reminders" className={item} onClick={() => setIsOpen(false)}>
              Reminders
            </Link>
          )}
          {user && (
            <Link href="/connect" className={item} onClick={() => setIsOpen(false)}>
              Connect
            </Link>
          )}
          <Link href="/instructions" className={item} onClick={() => setIsOpen(false)}>
            How it works
          </Link>
          <Link href="/faq" className={item} onClick={() => setIsOpen(false)}>
            FAQ
          </Link>
          <Link href="/contact" className={item} onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          <Link href="/help" className={item} onClick={() => setIsOpen(false)}>
            Help
          </Link>
          {user && (
            <Link href="/profile" className={item} onClick={() => setIsOpen(false)}>
              Profile
            </Link>
          )}
          <div className="px-5 pt-2 pb-1">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-ink"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
