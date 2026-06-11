import Link from 'next/link'

export const metadata = {
  title: 'FAQ — SessionRemind',
  description:
    'Answers to common questions about SessionRemind — connecting UseSession, how reminders work, your texting number, plans, and privacy.',
}

// Swiss-editorial FAQ page — Ink & Acid dark canvas, light ink type, acid accent, hairline rules.
// Server component; native <details>/<summary> so it works with zero JS.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="font-display text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-hairline bg-card transition-colors open:bg-panel">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span>{q}</span>
        <span
          aria-hidden
          className="mt-0.5 shrink-0 font-mono text-base leading-none text-accent transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="space-y-3 px-5 pb-5 text-[15px] leading-relaxed text-muted">{children}</div>
    </details>
  )
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 text-ink">
      <div className="eyebrow mb-4">Help</div>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.02]">
        Questions, <span className="text-accent">answered.</span>
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
        Everything photographers ask us most — how connecting works, when texts go out, what your clients
        see, and what it costs. Click any question to expand it.
      </p>

      <div className="mt-10 space-y-10">
        {/* ───────────── Getting started ───────────── */}
        <Section title="Getting started">
          <QA q="What does SessionRemind actually do?">
            <p>
              SessionRemind automatically sends text (and optionally email) reminders to your photography
              clients before their sessions. It syncs your bookings from UseSession, schedules a reminder
              for every upcoming session, and sends them at the right time — so you never have to chase a
              client or worry about a no-show again. You set it up once; after that it runs itself.
            </p>
          </QA>

          <QA q="How do I connect my UseSession account?">
            <p>
              It&apos;s a one-time setup, and you&apos;ll need a computer (any desktop browser works). On
              the{' '}
              <Link href="/connect" className="text-accent underline">
                Connect
              </Link>{' '}
              page, click <strong>Connect UseSession</strong>, drag the button it gives you to your
              bookmarks bar, then click that bookmark while you&apos;re logged into UseSession. That&apos;s
              it — your bookings start syncing right away.
            </p>
            <p>
              You never give us your UseSession password. The connection works through a secure access
              token, and once it&apos;s linked you can manage everything from your phone.
            </p>
          </QA>

          <QA q="Are you affiliated with UseSession?">
            <p>
              No. SessionRemind is an independent product and is not affiliated with, endorsed by, or
              sponsored by Session Technologies, LLC, the maker of UseSession. We simply work alongside it:
              UseSession handles your bookings, and SessionRemind makes sure your clients show up for them.
            </p>
          </QA>

          <QA q="I don't use UseSession. Can I still use SessionRemind?">
            <p>
              Yes. The{' '}
              <Link href="/connect" className="text-accent underline">
                Connect
              </Link>{' '}
              page has a CSV import that works without connecting anything — upload your client and session
              list and reminders are scheduled the same way.
            </p>
          </QA>
        </Section>

        {/* ───────────── Reminders & messages ───────────── */}
        <Section title="Reminders & messages">
          <QA q="When do reminders go out?">
            <p>
              By default, each client gets a text <strong>3 days before</strong> and{' '}
              <strong>1 day before</strong> their session, sent around <strong>10am Eastern</strong> — a
              time people actually read. Both the timing and the send hour are configurable in your
              settings.
            </p>
          </QA>

          <QA q="Can I customize what the message says?">
            <p>
              Absolutely. You write the template once, and placeholders fill in the details for every
              client automatically: <code>{'{name}'}</code>, <code>{'{sessionTitle}'}</code>,{' '}
              <code>{'{sessionTime}'}</code>, and <code>{'{studioName}'}</code>. And if one particular
              reminder needs a personal touch, you can edit or cancel it individually on the{' '}
              <Link href="/reminders" className="text-accent underline">
                Reminders
              </Link>{' '}
              page.
            </p>
          </QA>

          <QA q="What happens when a client reschedules or cancels?">
            <p>
              We sync with UseSession about every 5 minutes. New bookings get reminders scheduled
              automatically, rescheduled sessions have their pending reminders updated to the new time, and
              cancelled or deleted sessions have their reminders cancelled. No stale &ldquo;see you
              tomorrow!&rdquo; texts, no manual cleanup.
            </p>
          </QA>

          <QA q="Do my clients need to download or install anything?">
            <p>
              No. Your clients just receive normal text messages — nothing to install, no account to
              create. They can reply <strong>STOP</strong> at any time to opt out (we honor it
              automatically) or <strong>HELP</strong> for help. Reminders are transactional only — we never
              send your clients marketing.
            </p>
          </QA>

          <QA q="Can it send email reminders too?">
            <p>
              Yes — there&apos;s an optional toggle in your settings. When it&apos;s on, clients who have
              an email on file get a branded email reminder alongside their text, so the details are easy
              to find later.
            </p>
          </QA>
        </Section>

        {/* ───────────── Your texting number ───────────── */}
        <Section title="Your texting number">
          <QA q="What number do the texts come from?">
            <p>
              Reminders are sent from a dedicated toll-free number, so they look professional and deliver
              reliably — not from a random short code or your personal cell.
            </p>
          </QA>

          <QA q="Can I get my own number registered to my studio?">
            <p>
              Yes — studios on a paid plan can get their own dedicated toll-free number registered to their
              business, right inside the app. Go to <strong>Connect → Your texting number</strong>, fill
              in your business details once, and click <strong>Create my number</strong>.
            </p>
            <p>
              Carriers then verify the number, which typically takes a few days but can take up to about
              three weeks. You&apos;ll get an email the moment it&apos;s live — and your reminders keep
              sending normally the whole time, so nothing is interrupted.
            </p>
          </QA>
        </Section>

        {/* ───────────── Billing & plans ───────────── */}
        <Section title="Billing & plans">
          <QA q="How much does it cost?">
            <p>There are four monthly plans, sized by how many texts you send:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Starter</strong> — $15/mo, 150 texts included
              </li>
              <li>
                <strong>Studio</strong> — $29/mo, 500 texts included
              </li>
              <li>
                <strong>Pro</strong> — $59/mo, 1,500 texts included
              </li>
              <li>
                <strong>Volume</strong> — $119/mo, 4,000 texts included
              </li>
            </ul>
            <p>Every plan includes email reminders and automatic syncing from UseSession.</p>
          </QA>

          <QA q="What happens if I hit my monthly text limit?">
            <p>
              Your reminders keep sending — texts beyond your plan&apos;s included amount are simply
              billed per text at your plan&apos;s overage rate (3–5¢ each, shown on the pricing page)
              on your next invoice. As a safety net, overage is capped at one extra plan&apos;s worth
              of texts per month, so a runaway month can never surprise you. If you&apos;re regularly
              going over, upgrading to a bigger plan is cheaper — it takes effect right away.
              (Usage months are calendar months in UTC, which rolls over around 7–8pm Eastern on the
              last day of the month.)
            </p>
          </QA>

          <QA q="Can I cancel anytime?">
            <p>
              Yes. Billing runs through Stripe, and you can manage or cancel your subscription anytime from
              the{' '}
              <Link href="/profile" className="text-accent underline">
                Profile
              </Link>{' '}
              page via the Stripe billing portal. There&apos;s no long-term contract.
            </p>
          </QA>
        </Section>

        {/* ───────────── Privacy & data ───────────── */}
        <Section title="Privacy & data">
          <QA q="Is my UseSession data safe?">
            <p>
              Yes. Your access token is stored encrypted, and we only read what a reminder actually needs —
              the client&apos;s name, the session, its time, and a phone number. We never touch anything
              else in your account, and we never sell or share your data.
            </p>
          </QA>

          <QA q="What do you do with my clients' phone numbers?">
            <p>
              One thing only: send their session reminders. We never sell, rent, or share client numbers
              with anyone, and we never use them for marketing. The full details are in our{' '}
              <Link href="/privacy" className="text-accent underline">
                Privacy Policy
              </Link>
              .
            </p>
          </QA>
        </Section>
      </div>

      {/* ───────────── Still stuck ───────────── */}
      <div className="mt-14 rounded-2xl border border-hairline bg-panel p-6 sm:p-8">
        <div className="eyebrow mb-2">Still stuck?</div>
        <p className="text-[15px] leading-relaxed text-muted">
          Didn&apos;t find your answer? We&apos;re happy to help —{' '}
          <Link href="/contact" className="font-medium text-accent underline">
            contact us
          </Link>{' '}
          and a real person will get back to you.
        </p>
      </div>

      <div className="mt-12 border-t border-hairline pt-6">
        <Link href="/" className="text-sm font-medium text-muted hover:text-ink transition-colors">
          ← Back to SessionRemind
        </Link>
      </div>
    </div>
  )
}
