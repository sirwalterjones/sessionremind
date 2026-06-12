import Link from 'next/link'
import { PLANS } from '@/lib/plans'

// Ink & Acid marketing page — cool graphite, acid-lime accent, wide Archivo
// display type, mono spec labels, viewfinder brackets. Gear-UI, not SaaS-soft.
// Server component; all motion is CSS-only.

const A = 'rgb(var(--c-accent))' // theme accent (aqua)

function ArrowCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-accent-ink transition-shadow hover:shadow-glow"
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}

// Viewfinder corner brackets around a block.
function Brackets({ children }: { children: React.ReactNode }) {
  const c = 'absolute w-6 h-6 border-accent/80'
  return (
    <div className="relative p-3">
      <span className={`${c} top-0 left-0 border-t-2 border-l-2`} aria-hidden />
      <span className={`${c} top-0 right-0 border-t-2 border-r-2`} aria-hidden />
      <span className={`${c} bottom-0 left-0 border-b-2 border-l-2`} aria-hidden />
      <span className={`${c} bottom-0 right-0 border-b-2 border-r-2`} aria-hidden />
      {children}
    </div>
  )
}

export const metadata = {
  alternates: { canonical: '/' },
}

// Structured data: tells search engines what SessionRemind is, what it costs,
// and who makes it. Plan offers stay in lockstep with lib/plans.ts.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://sessionremind.com/#org',
      name: 'SessionRemind',
      url: 'https://sessionremind.com',
      logo: 'https://sessionremind.com/icon.svg',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@sessionremind.com',
        url: 'https://sessionremind.com/contact',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SessionRemind',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://sessionremind.com',
      description:
        'Automatic SMS & email session reminders for photographers. Syncs UseSession bookings and texts every client a perfectly-timed reminder before their shoot.',
      publisher: { '@id': 'https://sessionremind.com/#org' },
      offers: PLANS.map((plan) => ({
        '@type': 'Offer',
        name: `${plan.name} plan`,
        price: plan.price,
        priceCurrency: 'USD',
        description: `${plan.includedTexts.toLocaleString()} texts per month included`,
      })),
    },
  ],
}

export default function Home() {
  return (
    <div className="-mt-6 sm:-mt-10 text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* ───────────── HERO ───────────── */}
      <section className="full-bleed relative bg-canvas film-grain overflow-hidden">
        <div className="hero-glow absolute inset-0 h-[640px]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-12 items-center">
            {/* Left: message + CTAs */}
            <div>
              <div
                className="rise flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.22em] text-muted"
                style={{ animationDelay: '0.04s' }}
              >
                <span className="led inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                Set it once · never chase a client again
              </div>

              <h1
                className="rise font-display-wide mt-7 text-[2.7rem] sm:text-6xl lg:text-[4.6rem] leading-[1.02] font-bold"
                style={{ animationDelay: '0.1s' }}
              >
                They book.
                <br />
                We remind.
                <br />
                <span className="glow-accent text-accent">You shoot.</span>
              </h1>

              <p
                className="rise mt-7 text-lg leading-relaxed text-muted max-w-md"
                style={{ animationDelay: '0.18s' }}
              >
                Connect UseSession once. SessionRemind automatically texts every client a perfectly-timed
                reminder before their shoot — so your calendar actually shows up.
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.26s' }}>
                <ArrowCta href="/register">Get started</ArrowCta>
                <a
                  href="#how"
                  className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium text-muted hover:text-ink transition-colors"
                >
                  See how it works
                </a>
              </div>

              <div
                className="rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] uppercase tracking-[0.16em] text-faint"
                style={{ animationDelay: '0.32s' }}
              >
                <span>AES-256 encrypted</span>
                <span className="w-px h-3 bg-hairline" />
                <span>Your data, never touched</span>
                <span className="w-px h-3 bg-hairline" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Right: product walkthrough in a viewfinder */}
            <div className="rise relative" style={{ animationDelay: '0.3s' }}>
              <div
                className="absolute -inset-10 rounded-[48px] blur-3xl opacity-40"
                style={{ background: 'radial-gradient(60% 60% at 50% 45%, rgb(var(--c-accent) / 0.16), transparent 70%)' }}
                aria-hidden
              />
              <Brackets>
                <figure className="relative overflow-hidden rounded-lg border border-hairline bg-panel shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
                  <figcaption className="flex items-center justify-between px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-faint border-b border-hairline">
                    <span>SR-01 / Walkthrough</span>
                    <span className="flex items-center gap-2 text-muted">
                      <span className="led inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                      Live
                    </span>
                  </figcaption>
                  <video
                    className="block h-auto w-full"
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
                </figure>
              </Brackets>
            </div>
          </div>
        </div>
        <div className="tick-rule" aria-hidden />
      </section>

      {/* ───────────── STAT BAR ───────────── */}
      <section className="full-bleed bg-canvas border-b border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-3 divide-x divide-hairline">
          {[
            ['~60 sec', 'One-time setup'],
            ['0', 'Reminders you send by hand'],
            ['100%', 'Hands-off after connecting'],
          ].map(([v, l]) => (
            <div key={l} className="py-9 px-4 text-center">
              <div className="font-display text-3xl sm:text-5xl font-bold text-ink">{v}</div>
              <div className="mt-2.5 font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-faint">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how" className="full-bleed relative bg-panel film-grain">
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
            <div>
              <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-muted">
                How it works
              </div>
              <h2 className="font-display-wide text-3xl sm:text-5xl font-bold max-w-2xl">
                Three steps. Then it <span className="text-accent">runs itself.</span>
              </h2>
            </div>
            <p className="max-w-xs text-[15px] leading-relaxed text-muted">
              The first two take about a minute. The third happens forever, without you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              ['01', 'Connect once, from a computer', 'A quick drag-and-click in any browser links your account securely — your login is encrypted the instant it arrives. After that, manage everything from your phone.'],
              ['02', 'We keep your bookings in sync', 'Every few minutes we read just what a reminder needs — name, session, time. Reschedule or cancel a shoot and the reminders update automatically.'],
              ['03', 'Clients get texted & emailed', 'A warm, on-brand reminder goes out by text — and email, if you turn it on — 3 days and 1 day before each shoot, in your voice. You do nothing.'],
            ].map(([n, t, d]) => (
              <div key={n} className="frame-develop rounded-xl border border-hairline bg-card p-7 sm:p-8">
                <div className="flex items-center gap-3 mb-7">
                  <span className="font-mono text-sm tracking-[0.1em] text-accent">{n}</span>
                  <span className="h-px flex-1 bg-hairline" />
                  <span className="led inline-block w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-ink">{t}</h3>
                <p className="leading-relaxed text-[15px] text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── SECURITY ───────────── */}
      {/* Always-dark contrast band: pin the token vars to the dark palette so
          text/accent classes inside stay readable in BOTH themes. */}
      <section
        className="full-bleed bg-[#0B0C0E] text-[#F0F3F4] border-y border-hairline"
        style={
          {
            '--c-ink': '240 243 244',
            '--c-muted': '158 164 170',
            '--c-faint': '108 114 120',
            '--c-hairline': '39 43 49',
            '--c-card': '26 29 34',
            '--c-panel': '22 24 28',
            '--c-accent': '64 201 222',
            '--c-accent-ink': '4 42 49',
          } as React.CSSProperties
        }
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
            <div>
              <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-muted">
                Your data stays yours
              </div>
              <h2 className="font-display-wide text-3xl sm:text-5xl font-bold leading-[1.05]">
                A mailbox.
                <br />
                <span className="glow-accent text-accent">Not a microscope.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed max-w-md text-muted">
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
                    <h3 className="font-display text-lg font-semibold text-ink">{t}</h3>
                  </div>
                  <p className="text-[14px] leading-relaxed text-muted">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PRICING ───────────── */}
      <section className="full-bleed relative bg-canvas film-grain">
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-14">
            <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.22em] text-muted">Pricing</div>
            <h2 className="font-display-wide text-3xl sm:text-5xl font-bold leading-[1.05]">
              Plans that <span className="text-accent">scale</span> with you.
            </h2>
            <p className="mt-5 text-lg max-w-md mx-auto leading-relaxed text-muted">
              Every plan includes SMS &amp; email reminders, auto-sync, and your own templates. Pick by how
              many texts you send.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`flex flex-col rounded-xl border bg-card p-6 transition-colors ${
                  plan.key === 'studio'
                    ? 'border-accent/60 shadow-[0_0_60px_-20px_rgb(var(--c-accent)/0.35)]'
                    : 'border-hairline hover:border-faint'
                }`}
              >
                {plan.key === 'studio' && (
                  <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                    Most popular
                  </div>
                )}
                <div className="font-display text-lg font-semibold text-ink">{plan.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold text-ink">${plan.price}</span>
                  <span className="text-sm text-faint">/ mo</span>
                </div>
                <p className="mt-1 text-xs text-faint">
                  {plan.includedTexts.toLocaleString()} texts/mo · then ${plan.overage.toFixed(2)}/text
                </p>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted">{plan.blurb}</p>
                <Link
                  href={`/register?plan=${plan.key}`}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    plan.key === 'studio'
                      ? 'bg-accent text-accent-ink hover:shadow-glow'
                      : 'border border-hairline text-ink hover:bg-white/5'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-faint">
            Every plan: SMS &amp; email reminders · auto-sync · cancel anytime
          </p>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="full-bleed relative bg-canvas overflow-hidden border-t border-hairline">
        <div
          className="breathe absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(var(--c-accent) / 0.13), transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center">
          <h2 className="font-display-wide text-4xl sm:text-6xl font-bold leading-[1.02]">
            Put the reminders
            <br />
            on <span className="glow-accent text-accent">autopilot.</span>
          </h2>
          <div className="mt-10 flex justify-center">
            <ArrowCta href="/register">Get started</ArrowCta>
          </div>
          <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.16em] text-faint">
            Built for photographers who&apos;d rather be behind the camera
          </p>
        </div>
      </section>
    </div>
  )
}
