import type { Metadata } from 'next'

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Create Your Account',
  description:
    'Start sending automatic SMS & email session reminders to your photography clients. Plans from $15/mo — cancel anytime.',
  alternates: { canonical: '/register' },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
