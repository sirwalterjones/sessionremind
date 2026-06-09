import Link from 'next/link'

// Sleek Swiss-editorial marketing page — white canvas, ink type, one accent,
// hairline rules, generous whitespace, high-impact hero. Server component.

const A = '#DD4D24' // accent

function ArrowCta({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-all ${
        dark
          ? 'bg-white text-ink hover:bg-[#f0eee9]'
          : 'bg-ink text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)]'
      }`}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="overflow-x-clip -mt-6 sm:-mt-10 text-ink">
      {/* ───────────── HERO ───────────── */}
      <section className="full-bleed relative bg-white">
        <div className="grid-lines absolute inset-0 h-[480px]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
            {/* Left: message + CTAs */}
            <div>
              <div className="rise eyebrow flex items-center gap-2" style={{ animationDelay: '0.04s' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: A }} />
                Set it once · never chase a client again
              </div>

              <h1
                className="rise font-display mt-6 text-[3.4rem] sm:text-7xl lg:text-[5.2rem] leading-[0.92] font-semibold"
                style={{ animationDelay: '0.1s' }}
              >
                End no-shows
                <br />
                on <span style={{ color: A }}>autopilot.</span>
              </h1>

              <p
                className="rise mt-7 text-lg leading-relaxed text-[#4F4B44] max-w-md"
                style={{ animationDelay: '0.18s' }}
              >
                Connect UseSession once. SessionRemind automatically texts every client a perfectly-timed
                reminder before their shoot — so your calendar actually shows up.
              </p>

              <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.26s' }}>
                <ArrowCta href="/register">Get started</ArrowCta>
                <a
                  href="#how"
                  className="inline-flex items-center px-6 py-3.5 text-[15px] font-medium text-ink/70 hover:text-ink transition-colors"
                >
                  See how it works
                </a>
              </div>

              <div
                className="rise mt-10 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]"
                style={{ animationDelay: '0.32s' }}
              >
                <span>AES-256 encrypted</span>
                <span className="w-px h-3 bg-hairline" />
                <span>Your data, never touched</span>
                <span className="w-px h-3 bg-hairline" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Right: sleek product panel */}
            <div className="rise relative" style={{ animationDelay: '0.3s' }}>
              <div className="relative rounded-2xl border border-hairline bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)] overflow-hidden">
                {/* panel header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: A }} />
                    <span className="text-sm font-semibold tracking-tight">Automation</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#16a34a] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" /> Synced
                  </span>
                </div>
                {/* reminder rows */}
                <div className="divide-y divide-hairline">
                  {[
                    ['Ashley D.', 'Summer Greenhouse Mini', 'in 3 days'],
                    ['Maria Z.', 'Senior Session 2026', 'in 3 days'],
                    ['Kayla W.', 'Watermelon Mini', 'tomorrow'],
                  ].map(([n, s, w], i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <div className="text-sm font-medium">{n}</div>
                        <div className="text-xs text-[#8A857C]">{s}</div>
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A857C]">
                        Texts {w}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3.5 border-t border-hairline bg-[#FAFAF8] flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A958C]">
                    12 scheduled this week
                  </span>
                  <span className="text-xs font-medium" style={{ color: A }}>
                    Hands-off
                  </span>
                </div>
              </div>
              {/* floating text bubble */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 w-56 rounded-2xl bg-ink text-white p-4 shadow-xl rotate-[-3deg]">
                <p className="text-[13px] leading-snug">
                  Hi Ashley! Reminder about your shoot Saturday at 10 AM. Can’t wait! 📸
                </p>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">
                  Sent automatically
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── STAT BAR ───────────── */}
      <section className="full-bleed border-y border-hairline bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-3 divide-x divide-hairline">
          {[
            ['~60 sec', 'One-time setup'],
            ['0', 'Reminders you send by hand'],
            ['100%', 'Hands-off after connecting'],
          ].map(([v, l]) => (
            <div key={l} className="py-8 px-4 text-center">
              <div className="font-display text-3xl sm:text-4xl font-semibold">{v}</div>
              <div className="eyebrow mt-2">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how" className="full-bleed bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-14">
            <div>
              <div className="eyebrow mb-3">How it works</div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold max-w-xl">
                Three steps. Then it runs itself.
              </h2>
            </div>
            <p className="text-[#6E6A63] max-w-xs text-[15px] leading-relaxed">
              The first two take about a minute. The third happens forever, without you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
            {[
              ['01', 'Connect once, from a computer', 'A quick drag-and-click in any browser links your account securely — your login is encrypted the instant it arrives. After that, manage everything from your phone.'],
              ['02', 'We keep your bookings in sync', 'Every few minutes we read just what a reminder needs — name, session, time. Reschedule or cancel a shoot and the reminders update automatically.'],
              ['03', 'Clients get texted', 'A warm, on-brand reminder goes out 3 days and 1 day before each shoot — in your voice. You do nothing.'],
            ].map(([n, t, d]) => (
              <div key={n} className="group bg-white p-8 hover:bg-[#FCFBF9] transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-sm" style={{ color: A }}>
                    {n}
                  </span>
                  <span className="h-px flex-1 bg-hairline" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{t}</h3>
                <p className="text-[#5F5B54] leading-relaxed text-[15px]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── SECURITY (sleek dark) ───────────── */}
      <section className="full-bleed bg-[#0E0D0B] text-[#EFEAE0]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16">
            <div>
              <div className="eyebrow mb-4" style={{ color: '#8A8273' }}>
                Your data stays yours
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.02]">
                A mailbox.
                <br />
                <span style={{ color: A }}>Not a microscope.</span>
              </h2>
              <p className="mt-6 text-[#B6AE9E] text-lg leading-relaxed max-w-md">
                We&apos;re not in the business of your business. SessionRemind touches only what&apos;s needed to
                send a reminder — nothing else, ever.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
              {[
                ['Encrypted, always', 'Your UseSession access is sealed with AES-256 at rest. It exists only to fetch your reminders.'],
                ['Never mined or sold', 'No reading your client lists. No analytics on your people. We never store, share, or sell a single detail.'],
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
                  <p className="text-[#9C9484] text-[14px] leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PRICING ───────────── */}
      <section className="full-bleed bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="eyebrow mb-4">Pricing</div>
              <h2 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.0]">
                One plan.
                <br />
                Everything in it.
              </h2>
              <p className="mt-5 text-[#6E6A63] text-lg max-w-sm leading-relaxed">
                No tiers to decode. No per-text nickel-and-diming. Just every feature, one price.
              </p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-7xl font-semibold">$20</span>
                <span className="text-[#8A857C] text-lg">/ month</span>
              </div>
            </div>

            <div className="rounded-2xl border border-hairline p-8 sm:p-10">
              <div className="eyebrow mb-6">Professional · everything included</div>
              <ul className="space-y-4">
                {[
                  'Automatic UseSession sync',
                  '3-day & 1-day reminders, sent for you',
                  'Your studio name & custom templates',
                  'Up to 500 texts every month',
                  'Encrypted & private — data never touched',
                  'Edit or cancel any reminder anytime',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px]">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill={A}>
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ArrowCta href="/register">Start your subscription</ArrowCta>
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
                No setup fees · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="full-bleed bg-[#FAFAF8] border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center">
          <h2 className="font-display text-5xl sm:text-7xl font-semibold leading-[0.98]">
            Put the reminders
            <br />
            on <span style={{ color: A }}>autopilot.</span>
          </h2>
          <div className="mt-10 flex justify-center">
            <ArrowCta href="/register">Get started</ArrowCta>
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
            Built for photographers who&apos;d rather be behind the camera
          </p>
        </div>
      </section>
    </div>
  )
}
