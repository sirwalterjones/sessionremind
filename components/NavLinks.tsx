'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function NavLinks() {
  const { user, logout } = useAuth()

  const linkClass =
    'rounded-full border border-hairline px-3.5 py-1.5 text-sm font-medium text-[#4F4B44] hover:bg-[#F4F2EE] hover:text-ink transition-colors'

  return (
    <div className="hidden md:flex items-center gap-2">
      {/* Most-used destinations lead; Help and Profile sit at the end.
          Signed-in headers stay lean: docs/contact live under Help (and in
          the footer); signed-out visitors get the full marketing set. */}
      {user && (
        <Link href="/dashboard" className={linkClass}>
          Dashboard
        </Link>
      )}
      {user && (
        <Link href="/reminders" className={linkClass}>
          Reminders
        </Link>
      )}
      {user && (
        <Link href="/connect" className={linkClass}>
          Connect
        </Link>
      )}

      <Link href="/instructions" className={linkClass}>
        How it works
      </Link>
      {!user && (
        <Link href="/faq" className={linkClass}>
          FAQ
        </Link>
      )}
      {!user && (
        <Link href="/contact" className={linkClass}>
          Contact
        </Link>
      )}
      <Link href="/help" className={linkClass}>
        Help
      </Link>
      {user && (
        <Link href="/profile" className={linkClass}>
          Profile
        </Link>
      )}

      {user ? (
        <button
          onClick={logout}
          className="rounded-full border border-hairline px-3.5 py-1.5 text-sm font-medium text-[#4F4B44] hover:bg-[#F4F2EE] hover:text-ink transition-colors"
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
