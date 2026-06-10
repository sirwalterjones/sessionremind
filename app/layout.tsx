import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { AuthProvider } from '@/lib/auth-context'
import { NotificationsProvider } from '@/components/Notifications'
import NavLinks from '@/components/NavLinks'
import './globals.css'

// Swiss-editorial system: one clean grotesque for everything, with a monospaced
// face reserved for small uppercase labels/metadata. No generic Inter look.
const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sessionremind.com'),
  title: 'Session Remind - SMS Reminders for Photography Sessions',
  description: 'Professional SMS reminder app for photography sessions. Works seamlessly with Session to send automatic reminders to clients.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.svg', type: 'image/svg+xml', sizes: '16x16' },
      { url: '/favicon-32x32.svg', type: 'image/svg+xml', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/icon.svg',
    shortcut: '/favicon-16x16.svg'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Session Remind'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sessionremind.com',
    title: 'Session Remind - SMS Reminders for Photography Sessions',
    description: 'Professional SMS reminder app for photography sessions. Works seamlessly with Session to send automatic reminders to clients.',
    siteName: 'Session Remind',
    images: [
      {
        url: '/logo.svg',
        width: 512,
        height: 512,
        alt: 'Session Reminder Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Session Remind - SMS Reminders for Photography Sessions',
    description: 'Professional SMS reminder app for photography sessions. Works seamlessly with Session to send automatic reminders to clients.',
    images: ['/logo.svg']
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'fb:app_id': '1234567890' // Replace with your Facebook App ID if you have one
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${body.variable} ${mono.variable} ${body.className}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                      // Check for updates and force refresh if needed
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // New service worker available, force refresh
                              console.log('New service worker available, refreshing page');
                              window.location.reload();
                            }
                          });
                        }
                      });
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed');
                    });
                });
              }
            `,
          }}
        />
        <AuthProvider>
          <NotificationsProvider>
          <div className="min-h-screen bg-white text-[#141414]">
            <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-[#ECEAE4]">
              <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link href="/" className="flex items-center gap-3 group">
                    <span
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white text-[16px] font-bold tracking-tight transition-transform group-hover:scale-105"
                      style={{ background: '#141414' }}
                    >
                      Sr
                    </span>
                    <span className="text-[21px] font-semibold tracking-tight text-[#141414]">SessionRemind</span>
                  </Link>

                  <NavLinks />
                  <MobileNav />
                </div>
              </div>
            </nav>

            <main className="max-w-6xl mx-auto py-6 px-5 sm:py-10 sm:px-8">{children}</main>

            <footer className="border-t border-[#ECEAE4] mt-auto">
              <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center sm:items-start gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-[14px] font-bold tracking-tight"
                      style={{ background: '#141414' }}
                    >
                      Sr
                    </span>
                    <span className="text-base font-semibold tracking-tight">SessionRemind</span>
                  </div>
                  <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-[#6E6A63]">
                    <Link href="/help" className="hover:text-[#141414] transition-colors">Help</Link>
                    <Link href="/faq" className="hover:text-[#141414] transition-colors">FAQ</Link>
                    <Link href="/contact" className="hover:text-[#141414] transition-colors">Contact</Link>
                    <Link href="/privacy" className="hover:text-[#141414] transition-colors">Privacy</Link>
                    <Link href="/sms-opt-in" className="hover:text-[#141414] transition-colors">SMS terms</Link>
                  </nav>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9A958C]">
                    SMS &amp; E-mail Reminders for Sessions
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B5B0A8] mt-1">
                    Not affiliated with Session Technologies, LLC
                  </p>
                </div>
              </div>
            </footer>
          </div>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}