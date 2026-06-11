import Link from 'next/link'
import { PLANS } from '@/lib/plans'

// Help & documentation — Swiss-editorial docs page. Server component.
// Sticky section nav on desktop, jump-list on mobile, anchored sections.

export const metadata = {
  title: 'Help & Documentation — SessionRemind',
  description:
    'Everything you need to set up SessionRemind: connect UseSession, customize reminder texts, get your own texting number, and manage billing.',
}

const SECTIONS = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'connect-usesession', label: 'Connect UseSession' },
  { id: 'how-reminders-work', label: 'How reminders work' },
  { id: 'customize-messages', label: 'Customize your messages' },
  { id: 'email-reminders', label: 'Email reminders' },
  { id: 'manage-reminders', label: 'Manage scheduled reminders' },
  { id: 'texting-number', label: 'Your texting number' },
  { id: 'csv-import', label: 'Import bookings with CSV' },
  { id: 'billing', label: 'Billing' },
  { id: 'client-experience', label: 'Client experience & opt-out' },
]

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-hairline pt-10">
      <div className="eyebrow mb-3">{eyebrow}</div>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  )
}

// Numbered steps styled like the homepage "How it works" cards.
function Steps({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <ol className="overflow-hidden rounded-2xl border border-hairline divide-y divide-hairline">
      {items.map(([title, body], i) => (
        <li key={i} className="flex gap-4 bg-card p-5 sm:p-6">
          <span className="flex-shrink-0 pt-0.5 font-mono text-sm text-accent">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-[16px] font-semibold text-ink">{title}</h3>
            <div className="mt-1 text-[14px] leading-relaxed text-muted">{body}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-panel p-5 text-[14px] leading-relaxed text-muted">
      {children}
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="text-ink">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="eyebrow mb-4">Help</div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.02]">
          Help &amp; documentation
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Everything you need to put session reminders on autopilot — from connecting UseSession to
          getting your own texting number. Most studios are fully set up in about a minute.
        </p>
      </div>

      {/* Mobile jump-list */}
      <div className="mt-8 rounded-2xl border border-hairline bg-panel p-5 lg:hidden">
        <div className="eyebrow mb-3">Jump to</div>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-hairline bg-card px-3.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-accent/60"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Two-column layout: sticky nav + docs */}
      <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        {/* Sticky sidebar (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24" aria-label="On this page">
            <div className="eyebrow mb-4">On this page</div>
            <ul className="space-y-2.5 border-l border-hairline pl-4">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-sm leading-snug text-muted transition-colors hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-l border-hairline pl-4">
              <Link
                href="/contact"
                className="block text-sm font-medium text-accent transition-opacity hover:opacity-80"
              >
                Contact support →
              </Link>
            </div>
          </nav>
        </aside>

        {/* Docs content */}
        <div className="space-y-12">
          {/* 1 — Getting started */}
          <Section id="getting-started" eyebrow="Setup" title="Getting started">
            <p>
              SessionRemind automatically texts your clients a reminder before every photo session, so
              your calendar actually shows up. Setup takes three steps: create an account, pick a plan,
              and connect your booking tool.
            </p>
            <Steps
              items={[
                [
                  'Create your account',
                  <>
                    <Link href="/register" className="text-accent underline">
                      Register
                    </Link>{' '}
                    with your studio name, email, and a password. You can do this from any device.
                  </>,
                ],
                [
                  'Pick a plan',
                  <>
                    Every plan includes SMS &amp; email reminders, automatic syncing, and your own
                    message templates — pick by how many texts you send each month. Checkout is handled
                    securely by Stripe, and you can change or cancel anytime.
                  </>,
                ],
                [
                  'Connect UseSession',
                  <>
                    A one-time, ~60-second step from a computer (see{' '}
                    <a href="#connect-usesession" className="text-accent underline">
                      Connect UseSession
                    </a>{' '}
                    below). After that, reminders run themselves.
                  </>,
                ],
              ]}
            />
            <div className="overflow-hidden rounded-2xl border border-hairline">
              <div className="grid grid-cols-3 gap-2 border-b border-hairline bg-panel px-5 py-3">
                <span className="eyebrow">Plan</span>
                <span className="eyebrow">Price</span>
                <span className="eyebrow">Texts / month</span>
              </div>
              <div className="divide-y divide-hairline">
                {PLANS.map((plan) => (
                  <div key={plan.key} className="grid grid-cols-3 items-baseline gap-2 px-5 py-3.5">
                    <span className="font-display text-[15px] font-semibold text-ink">
                      {plan.name}
                    </span>
                    <span className="text-[15px] text-muted">
                      ${plan.price}
                      <span className="text-[13px] text-faint"> / mo</span>
                    </span>
                    <span className="font-mono text-[13px] text-muted">
                      {plan.includedTexts.toLocaleString()} included
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p>
              After checkout you land back in your dashboard with your subscription active immediately.
              Nothing sends until you connect UseSession or import bookings — so take a minute to set
              your studio name and message template first if you like.
            </p>
          </Section>

          {/* 2 — Connect UseSession */}
          <Section id="connect-usesession" eyebrow="One-time setup" title="Connect UseSession">
            <p>
              Connecting links your UseSession account to SessionRemind so bookings sync automatically.
              It’s a quick drag-and-click from a computer — any desktop browser works (Chrome, Safari,
              Firefox, Edge). You only ever do this once; afterwards you can manage everything from any
              device, including your phone.
            </p>
            <Steps
              items={[
                [
                  'Open the Connect page on a computer',
                  <>
                    Log in to SessionRemind and go to{' '}
                    <Link href="/connect" className="text-accent underline">
                      Connect
                    </Link>
                    , then click <strong className="text-ink">Connect UseSession</strong>. This
                    generates your personal connect button and pairing code.
                  </>,
                ],
                [
                  'Drag the button to your bookmarks bar',
                  <>
                    Drag the <strong className="text-ink">Connect to SessionRemind</strong> button up
                    into your browser’s bookmarks bar. Can’t drag it? Use the “copy the link” option,
                    create a new bookmark, and paste the link as its URL.
                  </>,
                ],
                [
                  'Switch to your logged-in UseSession tab',
                  <>
                    Open{' '}
                    <span className="font-mono text-[13px]">app.usesession.com</span> in another tab
                    and make sure you’re logged in. The bookmark reads your UseSession login, so it
                    only works on that tab — not on the SessionRemind tab.
                  </>,
                ],
                [
                  'Click the bookmark once',
                  <>
                    A small <strong className="text-ink">Connected!</strong> confirmation appears right
                    on the UseSession page, and the Connect tab detects it automatically. Your first
                    sync starts immediately and reminders begin scheduling themselves.
                  </>,
                ],
              ]}
            />
            <Note>
              <p className="font-display text-[15px] font-semibold text-ink">Troubleshooting</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-ink">“Not logged in” message?</strong> Log in to UseSession
                  first, then click the bookmark again — and make sure you’re clicking it while on the
                  UseSession tab, not the SessionRemind tab.
                </li>
                <li>
                  <strong className="text-ink">Can’t see your bookmarks bar?</strong> Press{' '}
                  <span className="font-mono text-[13px]">Cmd+Shift+B</span> on Mac or{' '}
                  <span className="font-mono text-[13px]">Ctrl+Shift+B</span> on Windows to show it.
                </li>
                <li>
                  <strong className="text-ink">Pairing code expired?</strong> Codes are valid for 10
                  minutes. Just go back to Connect, click Connect UseSession again, and drag the
                  fresh button to your bookmarks bar.
                </li>
              </ul>
            </Note>
            <p>
              Your UseSession access is AES-256 encrypted at rest and used only to read your upcoming
              bookings. It’s read-only — we never change, post, or delete anything in your account —
              and you can disconnect anytime from the Connect page.
            </p>
          </Section>

          {/* 3 — How reminders work */}
          <Section id="how-reminders-work" eyebrow="Autopilot" title="How reminders work">
            <p>
              Once connected, SessionRemind syncs with UseSession about every 5 minutes. Each sync
              reads just what a reminder needs — client name, session title, and time — and reconciles
              your scheduled reminders against your live calendar.
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong className="text-ink">New bookings schedule automatically.</strong> By default,
                every client gets a reminder <strong className="text-ink">3 days before</strong> and{' '}
                <strong className="text-ink">1 day before</strong> their session, sent mid-morning
                (around 10am Eastern) so it lands at a polite hour.
              </li>
              <li>
                <strong className="text-ink">Reschedules update themselves.</strong> If a session moves,
                every pending reminder shifts to the new date and time — no action needed.
              </li>
              <li>
                <strong className="text-ink">Cancellations cancel their reminders.</strong> If a booking
                is cancelled or deleted in UseSession, its pending reminders are cancelled too, so no
                one gets texted about a session that isn’t happening.
              </li>
              <li>
                <strong className="text-ink">Past sessions never send.</strong> A reminder whose send
                window has already passed is simply skipped — clients never get a late or confusing
                text.
              </li>
            </ul>
            <Note>
              <strong className="text-ink">Monthly text limit &amp; overage.</strong> Each plan includes
              a set number of texts per month. Go over and reminders keep sending — extra texts are
              billed at your plan&apos;s per-text overage rate (3–5¢) on your next invoice, capped at
              one extra plan&apos;s worth of texts per month so a busy season can&apos;t surprise you.
              Regularly over? Upgrading is cheaper and takes effect immediately.
            </Note>
          </Section>

          {/* 4 — Customize your messages */}
          <Section id="customize-messages" eyebrow="Your voice" title="Customize your messages">
            <p>
              Reminders go out in your voice. On the{' '}
              <Link href="/connect" className="text-accent underline">
                Connect
              </Link>{' '}
              page, under <strong className="text-ink">Reminder settings</strong>, you can adjust:
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong className="text-ink">Studio name</strong> — how your business signs each
                message.
              </li>
              <li>
                <strong className="text-ink">Reminder message template</strong> — write it however you
                like, using placeholders that fill in automatically per client:{' '}
                <span className="font-mono text-[13px]">{'{name}'}</span>{' '}
                <span className="font-mono text-[13px]">{'{sessionTitle}'}</span>{' '}
                <span className="font-mono text-[13px]">{'{sessionTime}'}</span>{' '}
                <span className="font-mono text-[13px]">{'{studioName}'}</span>
              </li>
              <li>
                <strong className="text-ink">Reminder timing</strong> — choose any combination of 7, 3,
                2, or 1 days before the session. Messages send mid-morning (around 10am Eastern).
              </li>
            </ul>
            <p>
              There’s no save button — changes save automatically as you make them, and new reminders
              pick up your latest template.
            </p>
            <Note>
              <strong className="text-ink">Keep it reminder-only.</strong> Your texting number is
              registered with carriers for appointment reminders, not marketing. Keep templates about
              the session itself — no promotions, sales, or upsells. It’s a carrier compliance
              requirement, and it’s what keeps your messages delivering reliably.
            </Note>
          </Section>

          {/* 5 — Email reminders */}
          <Section id="email-reminders" eyebrow="Belt and suspenders" title="Email reminders">
            <p>
              Want clients reminded in two places? Flip on{' '}
              <strong className="text-ink">Email reminders</strong> in the Connect settings. When a
              client has an email address on file, SessionRemind sends a clean, branded email alongside
              each text — same message, same timing.
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>It’s optional and off by default — one toggle turns it on.</li>
              <li>
                Emails send from{' '}
                <span className="font-mono text-[13px]">noreply@sessionremind.com</span> and carry your
                studio name, so clients know exactly who it’s from.
              </li>
              <li>
                Clients without an email on file simply get the text — nothing breaks, no one is
                skipped.
              </li>
            </ul>
          </Section>

          {/* 6 — Manage scheduled reminders */}
          <Section id="manage-reminders" eyebrow="Stay in control" title="Manage scheduled reminders">
            <p>
              The{' '}
              <Link href="/reminders" className="text-accent underline">
                Reminders
              </Link>{' '}
              page is your control room for everything that’s queued up or already out the door:
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong className="text-ink">Grouped by session</strong> — reminders are folded into one
                group per session (title and date), so a mini-session day with 20 clients stays tidy.
              </li>
              <li>
                <strong className="text-ink">Filter by status</strong> — flip between Scheduled, Sent,
                and Failed, or see everything at once.
              </li>
              <li>
                <strong className="text-ink">Search</strong> — find any reminder by client name, session
                title, or phone number.
              </li>
              <li>
                <strong className="text-ink">Edit</strong> — change a reminder’s message or its exact
                send time before it goes out.
              </li>
              <li>
                <strong className="text-ink">Cancel</strong> — remove any individual reminder so it’s
                never sent. The rest of the session’s reminders are unaffected.
              </li>
            </ul>
            <p>
              The Connect page also shows your upcoming reminders at a glance, with a one-click
              cancel on each.
            </p>
          </Section>

          {/* 7 — Your texting number */}
          <Section id="texting-number" eyebrow="Send as your studio" title="Your texting number">
            <p>
              Out of the box, your reminders send from a shared SessionRemind toll-free number that’s
              already carrier-verified — so texts start delivering on day one with zero paperwork.
            </p>
            <p>
              Studios on a paid plan can upgrade to a{' '}
              <strong className="text-ink">dedicated toll-free number</strong> registered to their own
              business, at no extra cost. We handle the carrier registration and consent paperwork for
              you:
            </p>
            <Steps
              items={[
                [
                  'Open “Your texting number”',
                  <>
                    From the{' '}
                    <Link href="/connect" className="text-accent underline">
                      Connect
                    </Link>{' '}
                    page, click <strong className="text-ink">Your texting number</strong>.
                  </>,
                ],
                [
                  'Confirm your business details',
                  <>
                    Enter your legal business name, website, address, and a contact person. Use your
                    real, legal information — carriers verify it against public records.
                  </>,
                ],
                [
                  'Click “Create my number”',
                  <>
                    We register a toll-free number to your business and submit it for carrier
                    verification on the spot.
                  </>,
                ],
                [
                  'Wait for carrier verification',
                  <>
                    Approval typically takes anywhere from a few days up to about 3 weeks — it’s the
                    carriers’ timeline, not ours. <strong className="text-ink">We email you the moment
                    it’s approved</strong> (or if anything needs fixing).
                  </>,
                ],
              ]}
            />
            <Note>
              Nothing pauses while you wait — your reminders keep sending from the shared number until
              your own number goes live, then switch over automatically.
            </Note>
          </Section>

          {/* 8 — CSV import */}
          <Section id="csv-import" eyebrow="No UseSession? No problem" title="Import bookings with CSV">
            <p>
              Not on UseSession, or just need a backup path? You can schedule reminders for a whole
              session day from a spreadsheet — right from the{' '}
              <Link href="/connect" className="text-accent underline">
                Connect
              </Link>{' '}
              page, and it works great on your phone.
            </p>
            <Steps
              items={[
                [
                  'Prepare your CSV',
                  <>
                    Any export works as long as there’s a{' '}
                    <span className="font-mono text-[13px]">Phone</span> column. A name column (or
                    First/Last columns) and an optional{' '}
                    <span className="font-mono text-[13px]">Email</span> column are picked up
                    automatically.
                  </>,
                ],
                [
                  'Upload it under “Import from a CSV”',
                  <>We show you exactly which rows were read and how many have usable phone numbers.</>,
                ],
                [
                  'Name the session and set its date & time',
                  <>
                    Enter the session title (for example, “Fall Mini Sessions”) and when it happens.
                  </>,
                ],
                [
                  'Import',
                  <>
                    Reminders are scheduled for every client in the file using your template and timing
                    settings — exactly like a synced booking.
                  </>,
                ],
              ]}
            />
          </Section>

          {/* 9 — Billing */}
          <Section id="billing" eyebrow="Subscription" title="Billing">
            <p>
              All payments run through Stripe’s secure checkout — SessionRemind never sees or stores
              your card details.
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong className="text-ink">Change or cancel anytime.</strong> Go to{' '}
                <Link href="/profile" className="text-accent underline">
                  Profile
                </Link>{' '}
                and open the <strong className="text-ink">Stripe billing portal</strong> to switch
                plans, update your payment method, download invoices, or cancel your subscription.
              </li>
              <li>
                <strong className="text-ink">Plan changes take effect right away</strong>, including
                your monthly text allowance.
              </li>
              <li>
                <strong className="text-ink">If your subscription lapses</strong> — whether you cancel
                or a payment fails — reminders stop sending and new bookings stop scheduling until you
                reactivate. Your settings, templates, reminder history, and UseSession connection are
                kept, so resubscribing picks up right where you left off.
              </li>
            </ul>
          </Section>

          {/* 10 — Client experience & opt-out */}
          <Section
            id="client-experience"
            eyebrow="What your clients see"
            title="Client experience & opt-out"
          >
            <p>
              Your clients receive a short, friendly text from your studio before their session — and a
              matching email if you’ve turned email reminders on. That’s it: these are{' '}
              <strong className="text-ink">transactional appointment reminders only</strong>, never
              marketing.
            </p>
            <ul className="list-disc space-y-2.5 pl-5">
              <li>
                <strong className="text-ink">STOP works instantly.</strong> If a client replies STOP to
                any message, the opt-out is recorded automatically and they receive no further texts —
                permanently, unless they text START to opt back in. You don’t need to do anything.
              </li>
              <li>
                <strong className="text-ink">HELP gets help.</strong> Replying HELP returns support
                information, and clients can always reach{' '}
                <a href="mailto:support@sessionremind.com" className="text-accent underline">
                  support@sessionremind.com
                </a>
                .
              </li>
              <li>
                <strong className="text-ink">Privacy, kept.</strong> Client numbers are used only to
                deliver reminders — never sold, shared, or used for marketing.
              </li>
            </ul>
            <p>
              For the full client-facing terms, see our{' '}
              <Link href="/sms-opt-in" className="text-accent underline">
                SMS messaging terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-accent underline">
                privacy policy
              </Link>
              .
            </p>
          </Section>

          {/* Need more help? */}
          <div className="rounded-2xl border border-hairline bg-panel p-8 sm:p-10 text-ink">
            <div className="eyebrow mb-3">
              Still stuck?
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">Need more help?</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              We’re photographers’ people — ask us anything and we’ll get you sorted, usually within a
              day.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-accent-ink transition-all hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)]"
              >
                Contact support <span aria-hidden>→</span>
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center rounded-full border border-hairline px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-white/5"
              >
                Browse the FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
