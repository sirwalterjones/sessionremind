import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { NotificationsProvider } from '@/components/Notifications'
import AppFrame from '@/components/AppFrame'
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
    // og:image / twitter:image come from app/opengraph-image.tsx + app/twitter-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Session Remind - SMS Reminders for Photography Sessions',
    description: 'Professional SMS reminder app for photography sessions. Works seamlessly with Session to send automatic reminders to clients.'
  },
  other: {
    'mobile-web-app-capable': 'yes'
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
            <AppFrame>{children}</AppFrame>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}