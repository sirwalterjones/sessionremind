'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCardIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function PaymentRequiredPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectPath: redirectPath
        })
      })

      const data = await response.json()
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment process')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Payment Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your account requires payment to access SessionRemind features
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">
                    {user.username}
                  </p>
                  <p className="text-sm text-blue-700">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Access Restricted
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your administrator has required payment for your account. 
                      Please complete payment to access SessionRemind features.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Plan Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Professional Plan
                </h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  $20
                  <span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Everything you need for session management
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">500 SMS messages per month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Automated session reminders</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Custom message templates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Usage analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
              </ul>

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Subscribe Now
                  </div>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Questions? Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  )
} 