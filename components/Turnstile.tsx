'use client'

// Cloudflare Turnstile widget. Loads the script once, renders explicitly, and
// reports the token via onVerify (null on expire/error). Renders nothing if the
// site key isn't configured, so local/dev without the env var still works.

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id?: string) => void
    }
  }
}

const SCRIPT_ID = 'cf-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export default function Turnstile({ onVerify }: { onVerify: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const cb = useRef(onVerify)
  cb.current = onVerify
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    let widgetId: string | null = null
    let poll: ReturnType<typeof setInterval> | undefined

    const render = () => {
      if (!window.turnstile || !ref.current || widgetId) return
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token: string) => cb.current(token),
        'expired-callback': () => cb.current(null),
        'error-callback': () => cb.current(null),
      })
    }

    if (window.turnstile) {
      render()
    } else if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script')
      s.id = SCRIPT_ID
      s.src = SCRIPT_SRC
      s.async = true
      s.defer = true
      s.onload = render
      document.head.appendChild(s)
    } else {
      poll = setInterval(() => {
        if (window.turnstile) {
          clearInterval(poll)
          render()
        }
      }, 200)
    }

    return () => {
      if (poll) clearInterval(poll)
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          /* ignore */
        }
      }
    }
  }, [siteKey])

  if (!siteKey) return null
  // Centered within whatever form it sits in (the widget itself is fixed-width).
  return <div ref={ref} className="my-3 flex justify-center" />
}
