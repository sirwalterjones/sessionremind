'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-stone-50 text-stone-600 hover:text-gray-900 hover:bg-stone-100 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu - Collapsible */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-stone-200 py-4 space-y-2 shadow-lg">
          <Link 
            href="/instructions" 
            className="flex items-center space-x-3 px-4 py-3 text-stone-600 hover:text-gray-900 hover:bg-stone-50 rounded-xl transition-all duration-200 mx-4"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-lg">📖</span>
            <span className="font-medium">How it Works</span>
          </Link>
          {user && (
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 px-4 py-3 text-stone-600 hover:text-gray-900 hover:bg-stone-50 rounded-xl transition-all duration-200 mx-4"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">📊</span>
              <span className="font-medium">Dashboard</span>
            </Link>
          )}
          {user && (
            <Link 
              href="/profile" 
              className="flex items-center space-x-3 px-4 py-3 text-stone-600 hover:text-gray-900 hover:bg-stone-50 rounded-xl transition-all duration-200 mx-4"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">👤</span>
              <span className="font-medium">Profile</span>
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-xl font-medium shadow-sm mx-4 hover:bg-red-700 transition-all duration-200 w-full text-left"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center space-x-3 px-4 py-3 bg-stone-800 text-white rounded-xl font-medium shadow-sm mx-4 hover:bg-stone-900 transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">🔑</span>
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </>
  )
}