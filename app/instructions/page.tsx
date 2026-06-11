'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

// Sleek Swiss-editorial "How it works" page — Ink & Acid theme tokens, accent
// highlights, hairline rules, generous whitespace. Theme-aware (light/dark).

function ArrowCta({
  href,
  children,
  dark = false,
}: {
  href: string
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-all ${
        dark
          ? 'border border-hairline text-ink hover:bg-ink/5'
          : 'bg-accent text-accent-ink font-semibold hover:shadow-glow'
      }`}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}

export default function Instructions() {
  const { user } = useAuth()

  // Logged-in photographers connect from the Connect page; new visitors register.
  const primaryHref = user ? '/connect' : '/register'
  const primaryLabel = user ? 'Connect UseSession' : 'Get started'

  return (
    <div className="-mt-6 sm:-mt-10 text-ink">
      {/* ───────────── HERO ───────────── */}
      <section className="full-bleed relative bg-canvas">
        <div className="hero-glow absolute inset-0 h-[420px]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="max-w-3xl">
            <div className="eyebrow flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
              How it works
            </div>

            <h1 className="font-display mt-6 text-[3.2rem] sm:text-7xl leading-[0.94] font-semibold">
              Connect once.
              <br />
              We do the <span className="text-accent">chasing.</span>
            </h1>

            <p className="mt-7 text-lg leading-relaxed text-muted max-w-xl">
              Link your UseSession account a single time. From then on, SessionRemind syncs your
              bookings and texts every client a perfectly-timed reminder before their shoot — no
              spreadsheets, no copy-paste, no chasing.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ArrowCta href={primaryHref}>{primaryLabel}</ArrowCta>
              <a
                href="#steps"
                className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium text-ink/70 hover:text-ink transition-colors"
              >
                See the three steps
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
              <span>One-click connect</span>
              <span className="w-px h-3 bg-hairline" />
              <span>No passwords stored</span>
              <span className="w-px h-3 bg-hairline" />
              <span>Disconnect anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── THREE STEPS ───────────── */}
      <section id="steps" className="full-bleed bg-panel border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
            <div>
              <div className="eyebrow mb-3">The flow</div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold max-w-xl">
                Three steps. Then it runs itself.
              </h2>
            </div>
            <p className="text-muted max-w-xs text-[15px] leading-relaxed">
              The first takes about a minute. The rest happens forever, without you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
            {[
              [
                '01',
                'Connect UseSession',
                'Once, from a computer: drag our Connect button to your bookmarks bar and click it while on UseSession. No passwords, no setup wizard — it reads just your access token and links your account.',
              ],
              [
                '02',
                'We sync your bookings',
                'Behind the scenes we pull only what a reminder needs — name, phone, email, session, date and time. Encrypted, read-only, and private to you.',
              ],
              [
                '03',
                'Clients get texted & emailed',
                'A warm, on-brand reminder goes out automatically 3 days and 1 day before every shoot — by text, and email if you turn it on. You never lift a finger.',
              ],
            ].map(([n, t, d]) => (
              <div key={n} className="group bg-card p-8 hover:bg-panel transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-sm text-accent">
                    {n}
                  </span>
                  <span className="h-px flex-1 bg-hairline" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{t}</h3>
                <p className="text-muted leading-relaxed text-[15px]">{d}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[14px] text-muted leading-relaxed max-w-2xl">
            No UseSession account, or prefer to work from a list?{' '}
            <span className="text-ink font-medium">Import a CSV instead</span> — drop in your
            bookings and the same automatic reminders take over from there.
          </p>
        </div>
      </section>

      {/* ───────────── CONNECTOR DETAIL ───────────── */}
      <section className="full-bleed bg-canvas border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="eyebrow mb-4">Step 01 · in detail</div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.02]">
                A single click,
                <br />
                <span className="text-accent">not a password.</span>
              </h2>
              <p className="mt-6 text-muted text-lg leading-relaxed max-w-md">
                Drag the SessionRemind Connector to your bookmarks bar, open UseSession while
                you&apos;re logged in, and click it. That&apos;s the whole setup. We never see your
                login — only an access token we use strictly read-only, encrypted the instant it
                arrives.
              </p>
              <div className="mt-8">
                <ArrowCta href={primaryHref}>{primaryLabel}</ArrowCta>
              </div>
            </div>

            {/* sleek connect panel */}
            <div className="relative">
              <div className="relative rounded-2xl border border-hairline bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm font-semibold tracking-tight">Connector</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Read-only
                  </span>
                </div>
                <div className="divide-y divide-hairline">
                  {[
                    ['Install the Connector', 'One-time, from your browser', 'Done'],
                    ['Open UseSession', 'Stay logged in as usual', 'Ready'],
                    ['Click Connect', 'Token encrypted & stored', 'Secured'],
                  ].map(([t, s, w], i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <div className="text-sm font-medium">{t}</div>
                        <div className="text-xs text-faint">{s}</div>
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                        {w}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3.5 border-t border-hairline bg-panel flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    Synced automatically
                  </span>
                  <span className="text-xs font-medium text-accent">
                    ~60 sec
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PRIVACY (sleek dark) ───────────── */}
      <section className="full-bleed bg-panel text-ink border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
            <div>
              <div className="eyebrow mb-4">
                Step 02 · your data stays yours
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.02]">
                We sync.
                <br />
                <span className="text-accent">We never snoop.</span>
              </h2>
              <p className="mt-6 text-muted text-lg leading-relaxed max-w-md">
                SessionRemind reads only what a reminder needs and nothing more. Your client list is
                your business — never ours to mine, share, or sell.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
              {[
                [
                  'AES-256 encrypted',
                  'Your UseSession access is sealed with AES-256 at rest. It exists only to fetch the bookings that need reminders.',
                ],
                [
                  'Never read or sold',
                  'We don’t mine your client lists or run analytics on your people. We store only what a reminder needs — and never share or sell a single detail.',
                ],
                [
                  'Read-only access',
                  'We never change, delete, or post anything in your account. We look at upcoming bookings — that’s the whole footprint.',
                ],
                [
                  'Disconnect anytime',
                  'Leave in one click and your stored access is deleted on the spot. Your clients, your data, your call.',
                ],
              ].map(([t, d]) => (
                <div key={t}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    <h3 className="font-display text-lg font-semibold text-ink">{t}</h3>
                  </div>
                  <p className="text-muted text-[14px] leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── AUTOMATIC REMINDERS ───────────── */}
      <section className="full-bleed bg-canvas border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="eyebrow mb-4">Step 03 · in detail</div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.02]">
                Two reminders per shoot,
                <br />
                <span className="text-accent">sent for you.</span>
              </h2>
              <p className="mt-6 text-muted text-lg leading-relaxed max-w-md">
                As soon as a booking syncs, two reminders are scheduled automatically — one three
                days out and one the day before. Sent by text (and email, if you turn it on),
                on-brand and completely hands-off.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                {[
                  ['3 days before', 'A friendly heads-up so clients can plan.'],
                  ['1 day before', 'A final nudge that cuts no-shows.'],
                ].map(([t, d]) => (
                  <div key={t}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                        {t}
                      </span>
                      <span className="h-px flex-1 bg-hairline" />
                    </div>
                    <p className="text-muted text-[14px] leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* reminder schedule panel */}
            <div className="relative">
              <div className="relative rounded-2xl border border-hairline bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm font-semibold tracking-tight">Scheduled</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synced
                  </span>
                </div>
                <div className="divide-y divide-hairline">
                  {[
                    ['Ashley D.', 'Summer Greenhouse Mini', 'in 3 days'],
                    ['Maria Z.', 'Senior Session 2026', 'in 3 days'],
                    ['Kayla W.', 'Watermelon Mini', 'tomorrow'],
                  ].map(([n, s, w], i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <div className="text-sm font-medium">{n}</div>
                        <div className="text-xs text-faint">{s}</div>
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                        Texts {w}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3.5 border-t border-hairline bg-panel flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    Sent on your behalf
                  </span>
                  <span className="text-xs font-medium text-accent">
                    Hands-off
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="full-bleed bg-panel border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center">
          <h2 className="font-display text-5xl sm:text-7xl font-semibold leading-[0.98]">
            Connect once.
            <br />
            Never chase <span className="text-accent">again.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ArrowCta href={primaryHref}>{primaryLabel}</ArrowCta>
            {user && (
              <Link
                href="/new"
                className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium text-ink/70 hover:text-ink transition-colors"
              >
                Create a reminder manually
              </Link>
            )}
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            Built for photographers who&apos;d rather be behind the camera
          </p>
        </div>
      </section>
    </div>
  )
}
