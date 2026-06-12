import type { Metadata } from 'next'

// The page itself is a client component, so its metadata lives here.
// Login has no search value — keep it out of the index.
export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
