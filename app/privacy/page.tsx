import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — SessionRemind',
  description: 'How SessionRemind handles your data and your UseSession connection.',
}

const UPDATED = 'June 8, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="font-display text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#4F4B44]">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="eyebrow mb-4">Privacy</div>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.02]">Privacy Policy</h1>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9A958C]">
        Last updated {UPDATED}
      </p>

      <p className="mt-8 text-[15px] leading-relaxed text-[#4F4B44]">
        SessionRemind helps photographers send SMS &amp; email reminders for sessions to clients who book through UseSession.
        This policy explains exactly what we access, why, and how we protect it. The short version: we touch only
        what&apos;s needed to send a reminder, and we never read, store, mine, share, or sell your client data.
      </p>

      <div className="mt-10 space-y-8">
        <Section title="What the SessionRemind Connector extension does">
          <p>
            The browser extension reads a single value — your UseSession access token — from your own
            already-logged-in UseSession session, and sends it to SessionRemind over an encrypted (HTTPS)
            connection so reminders can be scheduled on your behalf.
          </p>
          <p>
            The extension <strong>never asks for, sees, transmits, or stores your UseSession username or
            password.</strong> It does not read your browsing history, your activity on other sites, or any page
            other than UseSession when you click Connect.
          </p>
        </Section>

        <Section title="What we store">
          <ul className="list-disc list-inside space-y-2">
            <li>
              Your account details (email, login) and SessionRemind settings (studio name, message templates,
              reminder timing).
            </li>
            <li>
              Your UseSession access token, <strong>encrypted at rest with AES-256.</strong> It is used only to
              read your upcoming bookings. You can delete it instantly by clicking Disconnect.
            </li>
            <li>
              The reminders we schedule and send, and basic delivery status, so they appear on your dashboard.
            </li>
          </ul>
        </Section>

        <Section title="What we access from UseSession — and what we don't">
          <p>
            Using your token, we read only the fields a reminder needs from your upcoming sessions: the client&apos;s
            name, phone, and email, and the session title and time. Access is <strong>read-only</strong> — we never
            create, change, delete, or post anything in your UseSession account.
          </p>
          <p>
            We do not build profiles of your clients, run analytics on your client list, or use your data to train
            anything. We never sell or share your client data with third parties.
          </p>
        </Section>

        <Section title="Sending text messages">
          <p>
            Reminders are delivered via our SMS provider (TextMagic), which receives the recipient&apos;s phone number
            and the message text solely to deliver it. Clients can reply STOP to opt out at any time.
          </p>
        </Section>

        <Section title="Your control">
          <p>
            Disconnect UseSession at any time from your dashboard — this deletes your stored access token
            immediately. You may request deletion of your account and associated data by contacting us.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email{' '}
            <a href="mailto:support@sessionremind.com" className="text-accent underline">
              support@sessionremind.com
            </a>
            .
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
