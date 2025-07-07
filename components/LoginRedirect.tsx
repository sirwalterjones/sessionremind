'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface LoginRedirectProps {
  onSuccess: () => void
}

export default function LoginRedirect({ onSuccess }: LoginRedirectProps) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      onSuccess()
    }
  }, [user, loading, onSuccess])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-gray-600">Redirecting...</span>
      </div>
    )
  }

  return null
}