import Link from 'next/link'
import { PLANS } from '@/lib/plans'

// The Darkroom — marketing page. Warm-black canvas lit by a safelight (the
// brand accent), film-strip sprockets, a contact-sheet "how it works", and an
// editorial serif for display type. Server component; all motion is CSS-only.

const A = '#DD4D24' // accent / safelight
const PANEL = '#16110D'
const MUTED = '#9C9484'
const FAINT = '#6F6759'

function ArrowCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium text-white transition-all hover:shadow-[0_0_40px_-5px_rgba(221,77,36,0.55)]"
      style={{ background: A }}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}

function Sprockets() {
  return <div className="sprocket-row" aria-hidden />
}

export default function Home() {
  return (
    <div className="-mt-6 sm:-mt-10 text-[#EFEAE0]">
      {/* ───────────── HERO — under the safelight ───────────── */}
      <section className="full-bleed relative bg-[#0D0B09] film-grain overflow-hidden">
        <div className="safelight absolute inset-0 h-[640px]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-12 items-center">
            {/* Left: message + CTAs */}
            <div>
              <div
                className="rise flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A8273]"
                style={{ animationDelay: '0.04s' }}
              >
                <span className="led inline-block w-1.5 h-1.5 rounded-full" style={{ background: A }} />
                Set it once · never chase a client again
              </div>

              <h1
                className="rise font-serif-display mt-7 text-[3.5rem] sm:text-7xl lg:text-[5.4rem] leading-[0.98] font-medium text-white"
                style={{ animationDelay: '0.1s' }}
              >
                They book.
                <br />
                We remind.
                <br />
                <em className="glow-accent" style={{ color: A }}>
                  You shoot.
                </em>
              </h1>

              <p
                className="rise mt-7 text-lg leading-relaxed max-w-md"
                style={{ animationDelay: '0.18s', color: MUTED }}
              >
                Connect UseSession once. SessionRemind automatically texts every client a perfectly-timed
                reminder before their shoot — so your calendar actually shows up.
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.26s' }}>
                <ArrowCta href="/register">Get started</ArrowCta>
                <a
                  href="#how"
                  className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium text-[#CFC8BC] hover:text-white transition-colors"
                >
                  See how it works
                </a>
              </div>

              <div
                className="rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em]"
                style={{ animationDelay: '0.32s', color: FAINT }}
              >
                <span>AES-256 encrypted</span>
                <span className="w-px h-3 bg-white/15" />
                <span>Your data, never touched</span>
                <span className="w-px h-3 bg-white/15" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Right: product walkthrough, mounted as a film frame */}
            <div className="rise relative" style={{ animationDelay: '0.3s' }}>
              <div
                className="absolute -inset-8 rounded-[40px] blur-3xl opacity-50"
                style={{ background: 'radial-gradient(60% 60% at 50% 45%, rgba(221,77,36,0.3), transparent 70%)' }}
                aria-hidden
              />
              <figure className="relative overflow-hidden rounded-xl border border-white/10 bg-[#181410] shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
                <Sprockets />
                <figcaption className="flex items-center justify-between px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8273]">
                  <span>SR·400 — frame 36A</span>
                  <span className="flex items-center gap-2">
                    <span className="led inline-block w-1.5 h-1.5 rounded-full" style={{ background: A }} />
                    Product walkthrough
                  </span>
                </figcaption>
                <div className="px-3 pb-3">
                  <video
                    className="block h-auto w-full rounded-md"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    aria-label="SessionRemind product walkthrough"
                  >
                    <source src="/hero.mp4" type="video/mp4" />
                  </video>
                </div>
                <Sprockets />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── STAT STRIP — a length of film ───────────── */}
      <section className="full-bleed bg-[#0D0B09]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-24">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#181410]">
            <Sprockets />
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                ['22A', '~60 sec', 'One-time setup'],
                ['23A', '0', 'Reminders you send by hand'],
                ['24A', '100%', 'Hands-off after connecting'],
              ].map(([n, v, l]) => (
                <div key={l} className="relative py-9 px-4 text-center">
                  <span
                    className="absolute top-2.5 right-3 font-mono text-[10px] tracking-[0.18em]"
                    style={{ color: 'rgba(221,77,36,0.55)' }}
                    aria-hidden
                  >
                    {n}
                  </span>
                  <div className="font-serif-display text-3xl sm:text-5xl font-medium text-white">{v}</div>
                  <div className="mt-2.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em]" style={{ color: FAINT }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
            <Sprockets />
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS — the contact sheet ───────────── */}
      <section id="how" className="full-bleed relative bg-[#100D0A] film-grain border-y border-white/5">
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
            <div>
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#8A8273' }}>
                Contact sheet · how it works
              </div>
              <h2 className="font-serif-display text-4xl sm:text-6xl font-medium text-white max-w-xl">
                Three steps. Then it <em style={{ color: A }}>runs itself.</em>
              </h2>
            </div>
            <p className="max-w-xs text-[15px] leading-relaxed" style={{ color: MUTED }}>
              The first two take about a minute. The third happens forever, without you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              ['01A', 'Connect once, from a computer', 'A quick drag-and-click in any browser links your account securely — your login is encrypted the instant it arrives. After that, manage everything from your phone.'],
              ['02A', 'We keep your bookings in sync', 'Every few minutes we read just what a reminder needs — name, session, time. Reschedule or cancel a shoot and the reminders update automatically.'],
              ['03A', 'Clients get texted & emailed', 'A warm, on-brand reminder goes out by text — and email, if you turn it on — 3 days and 1 day before each shoot, in your voice. You do nothing.'],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="frame-develop rounded-xl border border-white/10 bg-[#17120E] p-7 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-7">
                  <span className="font-mono text-sm tracking-[0.1em]" style={{ color: A }}>
                    {n}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: FAINT }} aria-hidden>
                    exp
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-white">{t}</h3>
                <p className="leading-relaxed text-[15px]" style={{ color: MUTED }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── SECURITY — the vault ───────────── */}
      <section className="full-bleed bg-[#080706]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
            <div>
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#8A8273' }}>
                Your data stays yours
              </div>
              <h2 className="font-serif-display text-4xl sm:text-6xl font-medium leading-[1.04] text-white">
                A mailbox.
                <br />
                <em className="glow-accent" style={{ color: A }}>
                  Not a microscope.
                </em>
              </h2>
              <p className="mt-6 text-lg leading-relaxed max-w-md" style={{ color: '#B6AE9E' }}>
                We&apos;re not in the business of your business. SessionRemind touches only what&apos;s needed to
                send a reminder — nothing else, ever.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
              {[
                ['Encrypted, always', 'Your UseSession access is sealed with AES-256 at rest. It exists only to fetch your reminders.'],
                ['Never mined or sold', 'No mining your client lists. No analytics on your people. We store only what a reminder needs — a name, a number, the session details — and never share or sell a single detail.'],
                ['Read-only', 'We never change, delete, or post anything in your account. We look at upcoming bookings — that’s the whole footprint.'],
                ['Leave in one click', 'Disconnect anytime and your stored access is deleted on the spot. Your clients, your data, your call.'],
              ].map(([t, d]) => (
                <div key={t}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    <h3 className="font-display text-lg font-semibold text-white">{t}</h3>
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#9C9484' }}>
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PRICING — prints & paper stock ───────────── */}
      <section className="full-bleed relative bg-[#0D0B09] film-grain">
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-14">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: '#8A8273' }}>
              Pricing
            </div>
            <h2 className="font-serif-display text-4xl sm:text-6xl font-medium leading-[1.02] text-white">
              Plans that <em style={{ color: A }}>scale</em> with you.
            </h2>
            <p className="mt-5 text-lg max-w-md mx-auto leading-relaxed" style={{ color: MUTED }}>
              Every plan includes SMS &amp; email reminders, auto-sync, and your own templates. Pick by how
              many texts you send.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`flex flex-col rounded-xl border p-6 transition-colors ${
                  plan.key === 'studio'
                    ? 'border-[#DD4D24]/60 shadow-[0_0_60px_-20px_rgba(221,77,36,0.45)]'
                    : 'border-white/10 hover:border-white/25'
                }`}
                style={{ background: PANEL }}
              >
                {plan.key === 'studio' && (
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: A }}>
                    Most popular
                  </div>
                )}
                <div className="font-display text-lg font-semibold text-white">{plan.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-serif-display text-4xl font-medium text-white">${plan.price}</span>
                  <span className="text-sm" style={{ color: FAINT }}>
                    / mo
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: FAINT }}>
                  {plan.includedTexts.toLocaleString()} texts/mo · then ${plan.overage.toFixed(2)}/text
                </p>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                  {plan.blurb}
                </p>
                <Link
                  href={`/register?plan=${plan.key}`}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    plan.key === 'studio'
                      ? 'text-white hover:shadow-[0_0_30px_-5px_rgba(221,77,36,0.6)]'
                      : 'border border-white/15 text-[#EFEAE0] hover:bg-white/5'
                  }`}
                  style={plan.key === 'studio' ? { background: A } : undefined}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
            Every plan: SMS &amp; email reminders · auto-sync · cancel anytime
          </p>
        </div>
      </section>

      {/* ───────────── FINAL CTA — lights down, safelight on ───────────── */}
      <section className="full-bleed relative bg-[#0D0B09] overflow-hidden border-t border-white/5">
        <div
          className="breathe absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(221,77,36,0.22), transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center">
          <h2 className="font-serif-display text-5xl sm:text-7xl font-medium leading-[1.0] text-white">
            Put the reminders
            <br />
            on{' '}
            <em className="glow-accent" style={{ color: A }}>
              autopilot.
            </em>
          </h2>
          <div className="mt-10 flex justify-center">
            <ArrowCta href="/register">Get started</ArrowCta>
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
            Built for photographers who&apos;d rather be behind the camera
          </p>
        </div>
      </section>
    </div>
  )
}
