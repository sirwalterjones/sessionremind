'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function NavLinks() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="hidden md:flex items-center space-x-2">
      <Link 
        href="/instructions" 
        className="group relative px-4 py-2 text-stone-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-full hover:bg-stone-50"
      >
        <span className="flex items-center space-x-2">
          <span className="text-sm">📖</span>
          <span>How it Works</span>
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
      
      {user && (
        <Link 
          href="/profile" 
          className="group relative px-4 py-2 text-stone-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-full hover:bg-stone-50"
        >
          <span className="flex items-center space-x-2">
            <span className="text-sm">👤</span>
            <span>Profile</span>
          </span>
        </Link>
      )}
      
      <div className="w-px h-6 bg-stone-300 mx-2"></div>
      
      {user ? (
        <button
          onClick={handleLogout}
          className="group px-6 py-3 bg-red-600 text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-red-700 hover:scale-105"
        >
          <span className="flex items-center space-x-2">
            <span className="text-sm">🚪</span>
            <span>Logout</span>
          </span>
        </button>
      ) : (
        <Link 
          href="/login" 
          className="group px-6 py-3 bg-stone-800 text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:bg-stone-900 hover:scale-105"
        >
          <span className="flex items-center space-x-2">
            <span className="text-sm">🔑</span>
            <span>Login</span>
          </span>
        </Link>
      )}
    </div>
  )
} 