import Link from 'next/link'

// Warm editorial "darkroom" marketing page. Server component — CSS-only motion.
// Story: connect UseSession once -> reminders send automatically -> privacy first.

const ACCENT = '#BE7B2E'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-4xl text-[#211C16]" style={{ fontWeight: 500 }}>
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8A7E6B]">{label}</div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-8 font-body text-[#211C16]">
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden bg-[#F7F2E8] grain px-6 sm:px-10 lg:px-16 pt-14 sm:pt-20 pb-16 sm:pb-24">
        {/* soft light bloom */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40"
          style={{ background: `radial-gradient(circle, ${ACCENT}33, transparent 70%)` }}
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
          <div>
            <p
              className="rise text-[0.7rem] sm:text-xs uppercase tracking-[0.32em] text-[#9A8B70] mb-6"
              style={{ animationDelay: '0.05s' }}
            >
              Automatic reminders · built for UseSession
            </p>
            <h1
              className="rise font-display text-[2.7rem] sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-[#1C1814]"
              style={{ animationDelay: '0.12s', fontWeight: 480 }}
            >
              Nobody forgets
              <br />
              their session
              <br />
              <span className="italic" style={{ color: ACCENT }}>
                anymore.
              </span>
            </h1>
            <p
              className="rise mt-7 text-lg leading-relaxed text-[#5C5345] max-w-md"
              style={{ animationDelay: '0.2s' }}
            >
              Connect UseSession once. SessionRemind texts every client a reminder before their shoot —
              automatically, privately, and right on time. You just show up with your camera.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.28s' }}>
              <Link
                href="/register"
                className="inline-flex items-center px-7 py-3.5 rounded-full bg-[#1C1814] text-[#F7F2E8] font-medium hover:bg-[#000] transition-colors"
              >
                Start free
              </Link>
              <a
                href="#how"
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-[#1C1814]/15 text-[#1C1814] font-medium hover:bg-[#1C1814]/5 transition-colors"
              >
                See how it works
              </a>
            </div>
            <p className="rise mt-5 text-xs text-[#8A7E6B]" style={{ animationDelay: '0.34s' }}>
              AES-256 encrypted · We never read your client data · Cancel anytime
            </p>
          </div>

          {/* Phone mockup with a live-feeling reminder text */}
          <div className="rise relative mx-auto w-full max-w-[300px]" style={{ animationDelay: '0.36s' }}>
            <div className="relative rounded-[2.5rem] border-[6px] border-[#1C1814] bg-[#F2EADB] shadow-2xl p-4 pb-7">
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#1C1814]/20" />
              <div className="text-center text-xs text-[#8A7E6B] mb-4">Today · 10:02 AM</div>
              <div className="space-y-2.5">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#1C1814] text-[#F7F2E8] text-sm px-4 py-2.5 shadow">
                  Hi Ashley! Friendly reminder about your Summer Greenhouse Mini this Saturday at 10:00 AM.
                  Can&apos;t wait to see you! — Bella Verde Photography
                </div>
                <div className="ml-auto max-w-[60%] rounded-2xl rounded-br-md bg-[#1C1814] text-[#F7F2E8] text-sm px-4 py-2.5 shadow">
                  See you then! 📸
                </div>
                <div className="max-w-[70%] rounded-2xl rounded-bl-md bg-white text-[#211C16] text-sm px-4 py-2.5 shadow-sm border border-[#1C1814]/5">
                  Thank you so much for the reminder!! 💛
                </div>
              </div>
              <div
                className="mt-5 flex items-center justify-center gap-2 text-[0.7rem] uppercase tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                Sent automatically
              </div>
            </div>
          </div>
        </div>

        {/* stats row */}
        <div className="relative max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 border-t border-[#1C1814]/10 pt-8">
          <Stat value="0" label="No-shows missed" />
          <Stat value="~60 sec" label="One-time setup" />
          <Stat value="100%" label="Hands-off after" />
        </div>
      </section>

      {/* ───────────────── THE SHIFT ───────────────── */}
      <section className="bg-[#EFE7D6] px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl leading-snug text-[#1C1814]" style={{ fontWeight: 460 }}>
            No more spreadsheets. No more copy-paste from booking pages. No more 9pm
            “just confirming you&apos;re still coming?” texts.{' '}
            <span className="italic" style={{ color: ACCENT }}>
              It simply runs itself.
            </span>
          </p>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how" className="bg-[#F7F2E8] px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <h2 className="font-display text-4xl sm:text-5xl text-[#1C1814]" style={{ fontWeight: 480 }}>
              How it works
            </h2>
            <p className="text-[#6B6253] max-w-xs text-sm">
              Three steps. The first two take a minute. The third happens forever, on its own.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                t: 'Connect UseSession',
                d: 'One click while you’re logged in. Your account links securely — your login is encrypted the moment it arrives and never leaves our vault.',
              },
              {
                n: '02',
                t: 'We sync your bookings',
                d: 'Every few minutes we quietly check for new and upcoming sessions and read just the details a reminder needs — name, session, time.',
              },
              {
                n: '03',
                t: 'Clients get texted',
                d: 'A warm, on-brand reminder goes out 3 days and 1 day before each shoot — in your voice, with your studio name. You do nothing.',
              },
            ].map((s) => (
              <div
                key={s.n}
                className="group relative rounded-2xl bg-white/70 border border-[#1C1814]/8 p-7 hover:bg-white transition-colors"
              >
                <div className="font-display text-5xl text-[#1C1814]/12 mb-6" style={{ fontWeight: 500 }}>
                  {s.n}
                </div>
                <h3 className="font-display text-2xl text-[#1C1814] mb-3" style={{ fontWeight: 500 }}>
                  {s.t}
                </h3>
                <p className="text-[#5C5345] leading-relaxed text-[0.95rem]">{s.d}</p>
                <div
                  className="mt-6 h-px w-12 transition-all group-hover:w-20"
                  style={{ background: ACCENT }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SECURITY (inverted) ───────────────── */}
      <section className="relative overflow-hidden bg-[#1A1611] grain text-[#EDE4D3] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
        />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#A89476] mb-5">Your data stays yours</p>
          <h2 className="font-display text-4xl sm:text-6xl leading-[1.02] text-[#F7F2E8] max-w-3xl" style={{ fontWeight: 460 }}>
            A mailbox.{' '}
            <span className="italic" style={{ color: ACCENT }}>
              Not a microscope.
            </span>
          </h2>
          <p className="mt-6 text-lg text-[#C9BCA6] max-w-2xl leading-relaxed">
            We are not in the business of your business. SessionRemind touches only what&apos;s needed to send a
            reminder — and nothing else, ever.
          </p>

          <div className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {[
              ['Encrypted, always', 'Your UseSession access is sealed with AES-256 encryption at rest. Even we can’t read it casually — it exists only to fetch your reminders.'],
              ['We never mine your data', 'No reading client lists for fun. No analytics on your people. We don’t store, share, or sell a single client detail. Full stop.'],
              ['Read-only on your side', 'We never change, delete, or post anything in your UseSession account. We look at upcoming bookings — that’s the entire footprint.'],
              ['Leave in one click', 'Disconnect anytime and your stored access is deleted on the spot. Your clients, your data, your call.'],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-4">
                <div
                  className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: `${ACCENT}66` }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-xl text-[#F7F2E8] mb-1.5" style={{ fontWeight: 500 }}>
                    {t}
                  </h3>
                  <p className="text-[0.95rem] leading-relaxed text-[#B3A78C]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── PRICING ───────────────── */}
      <section className="bg-[#F7F2E8] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="font-display text-4xl sm:text-6xl text-[#1C1814]" style={{ fontWeight: 470 }}>
            One plan. Everything in it.
          </h2>
          <p className="mt-4 text-[#6B6253] max-w-md mx-auto">
            No tiers to decode. No per-text nickel-and-diming until you grow.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative rounded-[2rem] bg-white border border-[#1C1814]/10 shadow-xl p-9 overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24" style={{ background: `radial-gradient(circle at top right, ${ACCENT}22, transparent 70%)` }} />
            <p className="text-xs uppercase tracking-[0.24em] text-[#9A8B70]">Professional</p>
            <div className="mt-4 flex items-baseline">
              <span className="font-display text-6xl text-[#1C1814]" style={{ fontWeight: 520 }}>
                $20
              </span>
              <span className="ml-2 text-[#8A7E6B]">/ month</span>
            </div>
            <p className="mt-3 text-[#5C5345] text-sm">Everything you need to never chase a client again.</p>

            <ul className="mt-8 space-y-3.5">
              {[
                'Automatic UseSession sync',
                '3-day & 1-day reminders, sent for you',
                'Your studio name & custom message templates',
                'Up to 500 texts every month',
                'Encrypted & private — your data is never touched',
                'Edit or cancel any reminder anytime',
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.95rem] text-[#322B22]">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill={ACCENT}>
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

            <Link
              href="/register"
              className="mt-9 block w-full text-center px-8 py-4 rounded-full bg-[#1C1814] text-[#F7F2E8] font-medium hover:bg-black transition-colors"
            >
              Start your subscription
            </Link>
            <p className="mt-3 text-center text-xs text-[#8A7E6B]">No setup fees · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="bg-[#EFE7D6] px-6 sm:px-10 lg:px-16 py-20 sm:py-28 text-center">
        <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#1C1814] leading-[1.02]" style={{ fontWeight: 470 }}>
          Put the reminders
          <br />
          on <span className="italic" style={{ color: ACCENT }}>autopilot.</span>
        </h2>
        <Link
          href="/register"
          className="mt-10 inline-flex items-center px-9 py-4 rounded-full bg-[#1C1814] text-[#F7F2E8] font-medium hover:bg-black transition-colors"
        >
          Get started free
        </Link>
        <p className="mt-5 text-sm text-[#8A7E6B]">Built for photographers who&apos;d rather be behind the camera.</p>
      </section>
    </div>
  )
}
