import type { Metadata } from 'next'

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Connect UseSession once from a computer and SessionRemind automatically texts (and emails) your clients perfectly-timed session reminders — 3 days and 1 day before every shoot.',
  alternates: { canonical: '/instructions' },
}

export default function InstructionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
