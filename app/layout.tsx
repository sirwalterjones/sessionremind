import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { NotificationsProvider } from '@/components/Notifications'
import AppFrame from '@/components/AppFrame'
import './globals.css'

// Ink & Acid system: Archivo (variable width axis — stretched wide for display
// type via .font-display/.font-display-wide) with a monospaced face for small
// uppercase labels/metadata. No generic Inter look.
const body = Archivo({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  axes: ['wdth'],
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const SITE_TITLE = 'SessionRemind — SMS & Email Reminders for Photography Sessions'
const SITE_DESCRIPTION =
  'They book. We remind. You shoot. SessionRemind syncs your UseSession bookings and automatically ' +
  'texts (and emails) every client a perfectly-timed reminder before their photo session — so your ' +
  'calendar actually shows up. Plans from $15/mo.'

export const metadata: Metadata = {
  metadataBase: new URL('https://sessionremind.com'),
  title: {
    default: SITE_TITLE,
    // Child pages export bare titles ("FAQ") and get the brand suffix here.
    template: '%s — SessionRemind',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'SessionRemind',
  keywords: [
    'photography session reminders',
    'SMS reminders for photographers',
    'UseSession reminders',
    'client no-show prevention',
    'appointment reminder texts',
    'photography studio software',
  ],
  manifest: '/manifest.json',
  // NOTE: no root-level alternates.canonical — Next merges metadata downward,
  // so a canonical here would make every page claim "/" as canonical. Each
  // public page sets its own.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
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
    title: 'SessionRemind'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sessionremind.com',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: 'SessionRemind',
    // og:image / twitter:image come from app/opengraph-image.tsx + app/twitter-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION
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
        <meta name="theme-color" content="#FAFAF8" />
        <meta name="msapplication-TileColor" content="#FAFAF8" />
        {/* Apply the saved theme before first paint (light is the default). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.setAttribute('data-theme',localStorage.getItem('sr-theme')==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}`,
          }}
        />
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