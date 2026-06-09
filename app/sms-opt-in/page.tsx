import Link from 'next/link'

export const metadata = {
  title: 'SMS Messaging Terms — SessionRemind',
  description: 'How appointment reminder text messages work, and how to opt out.',
}

const UPDATED = 'June 9, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="font-display text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#4F4B44]">{children}</div>
    </section>
  )
}

export default function SmsOptInPage() {
  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="eyebrow mb-4">Messaging</div>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.02]">SMS Messaging Terms</h1>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">Last updated {UPDATED}</p>

      <p className="mt-8 text-[15px] leading-relaxed text-[#4F4B44]">
        SessionRemind sends appointment reminder text messages on behalf of the photography studio you booked a session
        with. This page explains the program, how you consent, and how to opt out at any time.
      </p>

      <div className="mt-10 space-y-8">
        <Section title="Program description">
          <p>
            You receive text message reminders about a photography session you booked — including the session date,
            time, and location, and occasional related logistics. These are <strong>transactional reminders only</strong>.
            We do not send marketing or promotional text messages through this program.
          </p>
        </Section>

        <Section title="How you opt in">
          <p>
            When you book a session through your photographer’s online booking page, you provide your mobile number and
            agree to receive reminder texts about that session. Providing your number for reminders is{' '}
            <strong>not a condition of any purchase</strong>.
          </p>
        </Section>

        <Section title="Message frequency">
          <p>
            Message frequency varies based on how many sessions you have booked — typically one to a few reminder
            messages per session.
          </p>
        </Section>

        <Section title="Cost">
          <p>
            <strong>Message and data rates may apply</strong>, depending on your mobile carrier and plan. Neither
            SessionRemind nor your photographer charges you for reminder messages.
          </p>
        </Section>

        <Section title="Opting out and help">
          <p>
            You can opt out at any time by replying <strong>STOP</strong> to any message. You will receive a one-time
            confirmation and no further reminder texts. For help, reply <strong>HELP</strong> or email{' '}
            <a href="mailto:support@sessionremind.com" className="text-accent underline">
              support@sessionremind.com
            </a>
            .
          </p>
        </Section>

        <Section title="Privacy">
          <p>
            We use your mobile number only to deliver these reminders. We do not sell, rent, or share mobile opt-in data
            or phone numbers with third parties or affiliates for their own marketing purposes. See our{' '}
            <Link href="/privacy" className="text-accent underline">
              Privacy Policy
            </Link>{' '}
            for full details. Carriers are not liable for delayed or undelivered messages.
          </p>
        </Section>
      </div>

      <div className="mt-12 border-t border-hairline pt-6">
        <Link href="/" className="text-sm font-medium text-[#6E6A63] hover:text-ink transition-colors">
          ← Back to SessionRemind
        </Link>
      </div>
    </div>
  )
}
