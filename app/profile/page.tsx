'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  UserIcon, 
  KeyIcon, 
  CreditCardIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  LinkIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  username: string
  email: string
  subscription_tier: string
  subscription_status: string
  is_admin: boolean
  payment_override: boolean
  stripe_customer_id: string | null
  sms_usage: number
  sms_limit: number
}

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isGeneratingStripeLink, setIsGeneratingStripeLink] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    fetchUserDetails()
  }, [user, router])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUserDetails(userData.user) // Extract user object from response
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      showNotification('error', 'Password must be at least 8 characters long')
      return
    }

    setIsResettingPassword(true)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        showNotification('success', 'Password updated successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordReset(false)
      } else {
        const error = await response.json()
        showNotification('error', error.message || 'Failed to update password')
      }
    } catch (error) {
      showNotification('error', 'Error updating password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleStripePortal = async () => {
    if (!userDetails?.stripe_customer_id) {
      showNotification('error', 'No Stripe customer ID found')
      return
    }

    setIsGeneratingStripeLink(true)
    
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: userDetails.stripe_customer_id })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
      } else {
        const error = await response.json()
        showNotification('error', error.message || 'Failed to generate Stripe portal link')
      }
    } catch (error) {
      showNotification('error', 'Error generating Stripe portal link')
    } finally {
      setIsGeneratingStripeLink(false)
    }
  }

  const getSubscriptionBadge = (tier: string, status: string, paymentOverride: boolean) => {
    if (paymentOverride) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <GiftIcon className="w-4 h-4 mr-1" />
          Admin Override
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <CreditCardIcon className="w-4 h-4 mr-1" />
        Professional • {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 flex items-center justify-center">
        <div className="animate-pulse text-stone-600">Loading profile...</div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 flex items-center justify-center">
        <div className="text-red-600">Error loading profile</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Profile</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
            {userDetails.is_admin && (
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 font-medium rounded-full hover:bg-purple-200 transition-all duration-200 text-sm"
              >
                Admin Console
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <div className="flex items-center mb-6">
                <UserIcon className="h-6 w-6 text-gray-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userDetails.username}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{userDetails.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                  <div className="mt-2">
                    {getSubscriptionBadge(userDetails.subscription_tier, userDetails.subscription_status, userDetails.payment_override)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMS Usage</label>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900">Used: {userDetails.sms_usage}</span>
                      <span className="text-gray-900">Limit: {userDetails.sms_limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((userDetails.sms_usage / userDetails.sms_limit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Reset */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <KeyIcon className="h-6 w-6 text-gray-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
                </div>
                <button
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  {showPasswordReset ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordReset && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResettingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stripe Portal */}
            {userDetails.stripe_customer_id && !userDetails.payment_override && (
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                <div className="flex items-center mb-4">
                  <CreditCardIcon className="h-6 w-6 text-gray-500 mr-3" />
                  <h2 className="text-lg font-semibold text-gray-900">Billing</h2>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  Access your Stripe customer portal to manage your subscription, view invoices, and update payment methods.
                </p>
                
                <button
                  onClick={handleStripePortal}
                  disabled={isGeneratingStripeLink}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isGeneratingStripeLink ? (
                    'Generating...'
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Stripe Portal
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-stone-100 text-stone-700 py-2 px-4 rounded-lg hover:bg-stone-200 transition-colors text-left"
                >
                  Back to Dashboard
                </button>
                
                <button
                  onClick={() => router.push('/new')}
                  className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-left"
                >
                  Create New Reminder
                </button>
                
                <button
                  onClick={logout}
                  className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 