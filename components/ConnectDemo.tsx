'use client'

import { useEffect, useState } from 'react'

// Looping animated demo of the bookmarklet connect flow, for /instructions:
//   Act 1 — drag the Connect button up into the browser's bookmarks bar
//   Act 2 — the address bar types app.usesession.com and the page switches
//   Act 3 — click the new bookmark → the "Connected" modal pops
// Same architecture as HeroDemo: a JS step timeline driving CSS transitions,
// with a static final frame for prefers-reduced-motion.

// Timeline (ms from cycle start) → step
//  1 grab + drag (cursor/ghost glide to the bar)   2 dropped (chip appears)
//  3 typing the UseSession URL                     4 UseSession page loaded
//  5 cursor heads to the bookmark                  6 click
//  7 connected modal
const TIMELINE: Array<[number, number]> = [
  [700, 1],
  [2300, 2],
  [3100, 3],
  [4400, 4],
  [5300, 5],
  [6300, 6],
  [6900, 7],
]
const CYCLE_MS = 11800
const FINAL_STEP = 7

// Cursor waypoints (% of the frame).
const AT_PILL = { left: '34%', top: '63%' }
// Lands on the "Connect to SessionRemind" bookmark in the bookmarks bar — NOT
// the dark UseSession header below it.
const AT_BAR = { left: '40%', top: '14.5%' }
const PARKED = { left: '78%', top: '82%' }

export default function ConnectDemo() {
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reduced) {
      setStep(FINAL_STEP)
      return
    }
    setStep(0)
    const timers = TIMELINE.map(([at, s]) => setTimeout(() => setStep(s), at))
    timers.push(setTimeout(() => setCycle((c) => c + 1), CYCLE_MS))
    return () => timers.forEach(clearTimeout)
  }, [cycle, reduced])

  const onUseSession = step >= 4
  const dragging = step === 1
  const chipVisible = step >= 2
  const clicked = step >= 6
  const connected = step >= 7
  // Highlight the address bar while the URL is typed / the page loads.
  const navigating = step >= 3 && step < 5

  const cursorPos = step === 0 ? AT_PILL : step === 1 || step >= 5 ? AT_BAR : PARKED

  return (
    <div aria-hidden className="select-none">
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-card shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
        {/* ── Browser chrome ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-hairline bg-panel px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-faint/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-faint/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-faint/40" />
          </div>
          <div
            className={`flex-1 overflow-hidden rounded-full border bg-card px-3.5 py-1.5 font-mono text-[11px] transition-all duration-300 ${
              navigating
                ? 'border-accent ring-2 ring-accent/30'
                : 'border-hairline'
            }`}
          >
            {step < 3 ? (
              <span className="tracking-wide text-muted">sessionremind.com/connect</span>
            ) : (
              <span
                key={`url-${cycle}`}
                className="inline-block overflow-hidden whitespace-nowrap align-bottom font-semibold tracking-normal text-accent"
                style={
                  reduced
                    ? undefined
                    : { animation: 'sr-cd-type 1.1s steps(19, end) both' }
                }
              >
                app.usesession.com
              </span>
            )}
          </div>
        </div>

        {/* ── Bookmarks bar ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-hairline bg-panel/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
          <span>Bookmarks</span>
          <span className="rounded border border-hairline px-2 py-0.5">News</span>
          {/* Drop target / landed bookmark — favicon + title, like a real one */}
          <span
            className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 normal-case tracking-normal transition-all duration-300 ${
              chipVisible
                ? 'border border-accent/60 bg-accent/10 text-ink'
                : dragging
                  ? 'border border-dashed border-accent/70 text-accent'
                  : 'border border-dashed border-transparent text-transparent'
            } ${clicked && !connected ? 'scale-90' : ''}`}
          >
            <span
              className={`flex h-3 w-3 items-center justify-center rounded-[3px] bg-accent text-[7px] font-bold leading-none text-accent-ink ${
                chipVisible ? '' : 'opacity-0'
              }`}
            >
              Sr
            </span>
            Connect to SessionRemind
          </span>
        </div>

        {/* ── Page area ──────────────────────────────────────────────── */}
        <div className="relative aspect-[4/2.9]">
          {/* Page A — SessionRemind /connect */}
          <div
            className={`absolute inset-0 p-5 transition-opacity duration-500 ${
              onUseSession ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[10.5px] font-bold text-canvas">
                Sr
              </span>
              <span className="text-[13px] font-semibold text-ink">SessionRemind</span>
            </div>
            <p className="mt-4 font-display text-[17px] font-semibold leading-snug text-ink">
              Connect your UseSession account
            </p>
            <p className="mt-1 max-w-[260px] text-[12px] leading-relaxed text-muted">
              Drag this button up to your bookmarks bar:
            </p>

            {/* The draggable pill (stays put; a ghost flies) */}
            <div className="relative mt-4 inline-block">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-accent-ink transition-opacity duration-300 ${
                  dragging ? 'opacity-30' : chipVisible ? 'opacity-40' : 'opacity-100'
                }`}
              >
                Connect to SessionRemind
              </span>
              {!chipVisible && !dragging && (
                <span className="absolute -inset-1 animate-ping rounded-full border border-accent/50" />
              )}
            </div>
            {chipVisible && (
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                ✓ Added to your bookmarks
              </p>
            )}
          </div>

          {/* Page B — the real Session app (app.usesession.com) */}
          <div
            className={`absolute inset-0 bg-card transition-opacity duration-500 ${
              onUseSession ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Session app header — light, lowercase "session" wordmark */}
            <div className="flex items-center justify-between border-b border-hairline px-5 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded-[5px] bg-ink" />
                <span className="text-[14px] font-semibold lowercase tracking-tight text-ink">session</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                <span className="text-ink">Sessions</span>
                <span>Calendar</span>
                <span>Clients</span>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {[
                ['AD', 'Ashley D.', 'Summer Greenhouse Mini · Jun 27'],
                ['MZ', 'Maria Z.', 'Senior Session · Jul 2'],
                ['KW', 'Kayla W.', 'Watermelon Mini · Jul 9'],
              ].map(([initials, name, detail]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-panel/50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-[10.5px] font-bold text-accent">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium leading-tight text-ink">{name}</p>
                      <p className="text-[11px] leading-tight text-muted">{detail}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-[#16a34a]/12 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#16a34a]">
                    Booked
                  </span>
                </div>
              ))}
            </div>

            {/* Connected toast — top-center, like the real injected popup */}
            <div
              className={`absolute left-1/2 top-3 w-[80%] max-w-[320px] -translate-x-1/2 rounded-xl border border-hairline bg-card p-4 shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition-all duration-300 ${
                connected ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[14px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">Connected!</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                    Scheduled 2 reminders. Your bookings now sync automatically — you can close
                    this tab.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Flying ghost pill (Act 1) */}
          <span
            className={`pointer-events-none absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-accent-ink shadow-lg transition-all duration-[1400ms] ease-in-out ${
              dragging ? 'opacity-95' : 'opacity-0 duration-200'
            }`}
            style={dragging ? { left: AT_BAR.left, top: '14%' } : { left: AT_PILL.left, top: '40%' }}
          >
            Connect to SessionRemind
          </span>
        </div>

        {/* ── Cursor (positioned over the whole frame) ───────────────── */}
        <svg
          viewBox="0 0 24 24"
          className={`pointer-events-none absolute z-20 h-5 w-5 drop-shadow-md transition-all ease-in-out ${
            step === 1 ? 'duration-[1400ms]' : 'duration-700'
          } ${clicked && !connected ? 'scale-90' : ''} ${reduced ? 'opacity-0' : ''}`}
          style={cursorPos}
        >
          <path
            d="M5 3l14 8.5-6.2 1.3L16 19l-2.8 1.4-3.2-6.2L5 18V3z"
            fill="var(--cursor-fill, #16181D)"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </svg>

        {/* Click ripple on the bookmark */}
        {clicked && !connected && (
          <span
            className="pointer-events-none absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-accent"
            style={AT_BAR}
          />
        )}
      </div>

      {/* Phase captions */}
      <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px] uppercase tracking-[0.14em] sm:text-[11px]">
        {[
          ['01', 'Drag to bookmarks', step >= 1 && step < 3],
          ['02', 'Open UseSession', step >= 3 && step < 6],
          ['03', 'Click it — connected', step >= 6],
        ].map(([n, label, active]) => (
          <div
            key={n as string}
            className={`rounded-lg border px-2.5 py-2 text-center transition-colors duration-300 ${
              active ? 'border-accent/60 bg-accent/10 text-ink' : 'border-hairline text-faint'
            }`}
          >
            <span className="text-accent">{n as string}</span>{' '}
            <span className="hidden sm:inline">{label as string}</span>
            <span className="sm:hidden">{(label as string).split(' ')[0]}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes sr-cd-type {
          from { width: 0; }
          to { width: 19ch; }
        }
      `}</style>
    </div>
  )
}
