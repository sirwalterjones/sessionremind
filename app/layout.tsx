import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://sessionremind.vercel.app'),
  title: 'Session Remind - SMS Reminders for Photography Sessions',
  description: 'Professional SMS reminder app for photography sessions. Works seamlessly with UseSession to send automatic reminders to clients.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/icon.svg'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Session Remind'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sessionremind.vercel.app',
    title: 'Session Remind - SMS Reminders for Photography Sessions',
    description: 'Professional SMS reminder app for photography sessions. Works seamlessly with UseSession to send automatic reminders to clients.',
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
    description: 'Professional SMS reminder app for photography sessions. Works seamlessly with UseSession to send automatic reminders to clients.',
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
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed');
                    });
                });
              }
            `,
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="flex justify-between items-center h-20">
                {/* Logo Section */}
                <div className="flex items-center">
                  <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                      <span className="text-white text-lg sm:text-xl font-bold">S</span>
                    </div>
                    <div className="block">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                        Session Remind
                      </h1>
                    </div>
                  </Link>
                </div>
                
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link 
                    href="/instructions" 
                    className="group relative px-4 py-2 text-stone-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-full hover:bg-stone-50"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-sm">📖</span>
                      <span>Guide</span>
                    </span>
                  </Link>
                  
                  <Link 
                    href="/dashboard" 
                    className="group relative px-4 py-2 text-stone-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-full hover:bg-stone-50"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-sm">📊</span>
                      <span>Dashboard</span>
                    </span>
                  </Link>
                  
                  <div className="w-px h-6 bg-stone-300 mx-2"></div>
                  
                  <Link 
                    href="/new" 
                    className="group px-6 py-3 bg-stone-800 text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-stone-900 hover:scale-105"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-sm">✨</span>
                      <span>New Reminder</span>
                    </span>
                  </Link>
                </div>
                
                <MobileNav />
              </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto py-4 px-4 sm:py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-stone-200 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <p className="text-sm text-stone-600">
                  Made with <span className="text-red-500">❤️</span> by Jones Web Design & Development
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}