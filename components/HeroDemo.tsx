'use client'

import { useEffect, useState } from 'react'

// Animated hero panel: plays the product story on a loop — calendar syncs,
// bookings appear, a reminder text types out and sends. Pure DOM + CSS
// transitions; falls back to the final (static) frame for reduced motion.

const A = '#DD4D24'

const ROWS: Array<[string, string, string]> = [
  ['Ashley D.', 'Summer Greenhouse Mini', 'in 3 days'],
  ['Maria Z.', 'Senior Session 2026', 'in 3 days'],
  ['Kayla W.', 'Watermelon Mini', 'tomorrow'],
]

// Timeline (ms from cycle start) → step number
const TIMELINE: Array<[number, number]> = [
  [700, 1], // synced
  [1100, 2], // row 1
  [1500, 3], // row 2
  [1900, 4], // row 3
  [2700, 5], // bubble + typing dots
  [4100, 6], // message text
  [5100, 7], // delivered
]
const CYCLE_MS = 8200
const FINAL_STEP = 7

export default function HeroDemo() {
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
  }, [reduced, cycle])

  const synced = step >= 1
  const rowsShown = step >= 4 ? 3 : step >= 3 ? 2 : step >= 2 ? 1 : 0
  const bubbleShown = step >= 5
  const typing = step === 5
  const delivered = step >= 7

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
        {/* panel header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: A }} />
            <span className="text-sm font-semibold tracking-tight">Connect</span>
          </div>
          {synced ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#16a34a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> Synced
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D9A441]" /> Syncing…
            </span>
          )}
        </div>

        {/* reminder rows */}
        <div className="divide-y divide-hairline">
          {ROWS.map(([n, s, w], i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5 transition-all duration-500 ease-out"
              style={{
                opacity: i < rowsShown ? 1 : 0,
                transform: i < rowsShown ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              <div>
                <div className="text-sm font-medium">{n}</div>
                <div className="text-xs text-[#8A857C]">{s}</div>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8A857C]">
                Texts {w}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-hairline bg-[#FAFAF8] px-5 py-3.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
            {rowsShown > 0 ? `${9 + rowsShown} scheduled this week` : 'Checking calendar…'}
          </span>
          <span className="text-xs font-medium" style={{ color: A }}>
            Hands-off
          </span>
        </div>
      </div>

      {/* floating text bubble */}
      <div
        className="absolute -bottom-6 -left-4 w-56 rotate-[-3deg] rounded-2xl bg-ink p-4 text-white shadow-xl transition-all duration-500 ease-out sm:-left-8"
        style={{
          opacity: bubbleShown ? 1 : 0,
          transform: bubbleShown
            ? 'rotate(-3deg) translateY(0) scale(1)'
            : 'rotate(-3deg) translateY(12px) scale(0.96)',
        }}
      >
        {typing ? (
          <div className="flex h-[54px] items-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
                style={{ animationDelay: `${d * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-[14px] leading-snug">
            Hi Ashley! Reminder about your shoot Saturday at 10 AM. Can&apos;t wait! 📸
          </p>
        )}
        <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em]">
          {delivered ? (
            <span className="text-[#4ade80]">Delivered ✓</span>
          ) : (
            <span className="text-white/50">{typing ? 'Writing…' : 'Sending…'}</span>
          )}
        </div>
      </div>
    </div>
  )
}
