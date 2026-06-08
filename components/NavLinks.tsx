'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function NavLinks() {
  const { user, logout } = useAuth()

  const linkClass =
    'text-sm font-medium text-[#6E6A63] hover:text-ink transition-colors'

  return (
    <div className="hidden md:flex items-center gap-7">
      <Link href="/instructions" className={linkClass}>
        How it works
      </Link>

      {user && (
        <Link href="/automation" className={linkClass}>
          Automation
        </Link>
      )}
      {user && (
        <Link href="/dashboard" className={linkClass}>
          Dashboard
        </Link>
      )}
      {user && (
        <Link href="/profile" className={linkClass}>
          Profile
        </Link>
      )}

      {user ? (
        <button
          onClick={logout}
          className="text-sm font-medium text-[#6E6A63] hover:text-ink transition-colors"
        >
          Log out
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Sign in
        </Link>
      )}
    </div>
  )
}
