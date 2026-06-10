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
    'block px-5 py-3 text-[15px] font-medium text-[#4F4B44] hover:text-ink hover:bg-[#FAFAF8] transition-colors'

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
        <div className="absolute top-full left-0 right-0 bg-white border-t border-hairline py-2">
          <Link href="/instructions" className={item} onClick={() => setIsOpen(false)}>
            How it works
          </Link>
          <Link href="/help" className={item} onClick={() => setIsOpen(false)}>
            Help
          </Link>
          <Link href="/faq" className={item} onClick={() => setIsOpen(false)}>
            FAQ
          </Link>
          <Link href="/contact" className={item} onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          {user && (
            <Link href="/automation" className={item} onClick={() => setIsOpen(false)}>
              Automation
            </Link>
          )}
          {user && (
            <Link href="/reminders" className={item} onClick={() => setIsOpen(false)}>
              Reminders
            </Link>
          )}
          {user && (
            <Link href="/dashboard" className={item} onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          )}
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
                className="block text-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white"
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
