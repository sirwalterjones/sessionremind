import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Session Reminder',
  description: 'SMS reminder app for photography sessions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                {/* Logo Section */}
                <div className="flex items-center">
                  <a href="/" className="flex items-center space-x-3 group">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <span className="text-white text-xl">📱</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Session Reminder
                      </h1>
                      <p className="text-xs text-slate-500 font-medium">for photographers</p>
                    </div>
                  </a>
                </div>
                
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-2">
                  <a 
                    href="/instructions" 
                    className="group relative px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-all duration-200 rounded-xl hover:bg-white/50"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-sm">📖</span>
                      <span>Guide</span>
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full"></div>
                  </a>
                  
                  <a 
                    href="/dashboard" 
                    className="group relative px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-all duration-200 rounded-xl hover:bg-white/50"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-sm">📊</span>
                      <span>Dashboard</span>
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full"></div>
                  </a>
                  
                  <div className="w-px h-6 bg-slate-300 mx-2"></div>
                  
                  <a 
                    href="/new" 
                    className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span className="text-sm">✨</span>
                      <span>New Reminder</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </div>
                
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button className="p-2 rounded-xl bg-white/50 text-slate-600 hover:text-slate-900 hover:bg-white/70 transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Mobile Menu - Hidden by default */}
              <div className="md:hidden border-t border-white/20 py-4 space-y-2">
                <a 
                  href="/instructions" 
                  className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
                >
                  <span className="text-lg">📖</span>
                  <span className="font-medium">How to Use</span>
                </a>
                <a 
                  href="/dashboard" 
                  className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
                >
                  <span className="text-lg">📊</span>
                  <span className="font-medium">Dashboard</span>
                </a>
                <a 
                  href="/new" 
                  className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg mx-2"
                >
                  <span className="text-lg">✨</span>
                  <span>New Reminder</span>
                </a>
              </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}