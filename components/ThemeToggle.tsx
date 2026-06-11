'use client'

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

type Theme = 'light' | 'dark'

// Light/dark switch. The current theme lives on <html data-theme> (set before
// first paint by the inline script in app/layout.tsx) and persists in
// localStorage under 'sr-theme'. Light is the default.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme')
    setTheme(t === 'dark' ? 'dark' : 'light')
  }, [])

  const flip = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('sr-theme', next)
    } catch {
      /* private mode etc. — theme still applies for this page */
    }
  }

  return (
    <button
      onClick={flip}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
      className="rounded-full border border-hairline p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
    >
      {/* render a stable icon size pre-hydration to avoid layout shift */}
      {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </button>
  )
}
