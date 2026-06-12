import type { Metadata } from 'next'

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Contact & Support',
  description:
    'Questions, billing, a bug, an idea — talk to a human at SessionRemind. We reply within a business day.',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
