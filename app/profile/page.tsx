'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
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
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
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

  const startEdit = () => {
    if (!userDetails) return
    setEditUsername(userDetails.username)
    setEditEmail(userDetails.email)
    setEditing(true)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername, email: editEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setUserDetails((u) => (u ? { ...u, username: data.user.username, email: data.user.email } : u))
      if (refreshUser) await refreshUser()
      setEditing(false)
      showNotification(
        'success',
        data.emailChanged ? 'Profile updated — check your new email to verify it.' : 'Profile updated.'
      )
    } catch (err: any) {
      showNotification('error', err?.message || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
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
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 text-[13px] font-medium text-ink">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#DD4D24' }} />
          Admin Override
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 text-[13px] font-medium text-ink">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink" />
        Professional · {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="eyebrow animate-pulse">Loading profile…</div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-[15px] text-[#B23A1E]">Error loading profile</div>
      </div>
    )
  }

  return (
    <div className="text-ink">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-5 z-50 rounded-lg border px-4 py-3 text-[14px] font-medium ${
            notification.type === 'success'
              ? 'border-hairline bg-white text-ink'
              : 'border-[#E7C3B8] bg-white text-[#B23A1E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                notification.type === 'success' ? 'bg-[#16a34a]' : 'bg-[#B23A1E]'
              }`}
            />
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            aria-label="Back to dashboard"
            className="mt-1 rounded-full border border-hairline p-2 text-ink transition-colors hover:bg-[#FAFAF8]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <div>
            <div className="eyebrow mb-2">Account</div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.0]">Profile</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6E6A63]">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
        {userDetails.is_admin && (
          <button
            onClick={() => router.push('/admin')}
            className="rounded-full border border-hairline px-5 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-[#FAFAF8]"
          >
            Admin Console
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="rounded-2xl border border-hairline p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-semibold">Account information</h2>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="rounded-full border border-hairline px-5 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-[#FAFAF8]"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="mt-6 space-y-5">
                <div>
                  <label className="eyebrow mb-2 block">Username</label>
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-2 block">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    Changing your email requires re-verifying the new address.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-full bg-ink px-5 py-2.5 text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-hairline px-5 py-2.5 font-medium text-ink transition-colors hover:bg-[#FAFAF8]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 divide-y divide-hairline">
                <div className="flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="eyebrow">Username</span>
                  <span className="text-[15px] font-medium text-ink">{userDetails.username}</span>
                </div>
                <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="eyebrow">Email</span>
                  <span className="text-[15px] font-medium text-ink">{userDetails.email}</span>
                </div>
              </div>
            )}

            <div className="mt-2 divide-y divide-hairline border-t border-hairline">
              <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="eyebrow">Subscription</span>
                {getSubscriptionBadge(userDetails.subscription_tier, userDetails.subscription_status, userDetails.payment_override)}
              </div>

              <div className="py-4 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">SMS Usage</span>
                  <span className="font-mono text-[12px] text-[#6E6A63]">
                    {userDetails.sms_usage} / {userDetails.sms_limit}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                  <div
                    className="h-full rounded-full bg-ink transition-all"
                    style={{ width: `${Math.min((userDetails.sms_usage / userDetails.sms_limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Reset */}
          <div className="rounded-2xl border border-hairline p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-semibold">Password &amp; security</h2>
              <button
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="rounded-full border border-hairline px-5 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-[#FAFAF8]"
              >
                {showPasswordReset ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordReset && (
              <form onSubmit={handlePasswordReset} className="mt-6 space-y-5">
                <div>
                  <label className="eyebrow mb-2 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6E6A63]"
                    >
                      {showPasswords.current ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="eyebrow mb-2 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6E6A63]"
                    >
                      {showPasswords.new ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="eyebrow mb-2 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full rounded-lg border border-hairline px-3.5 py-2.5 text-[15px] focus:border-ink focus:outline-none pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6E6A63]"
                    >
                      {showPasswords.confirm ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full rounded-full bg-ink px-5 py-2.5 text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResettingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stripe Portal */}
          {userDetails.stripe_customer_id && !userDetails.payment_override && (
            <div className="rounded-2xl border border-hairline p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold">Billing</h2>

              <p className="mt-3 text-[14px] leading-relaxed text-[#6E6A63]">
                Access your Stripe customer portal to manage your subscription, view invoices, and update payment methods.
              </p>

              <button
                onClick={handleStripePortal}
                disabled={isGeneratingStripeLink}
                className="mt-5 w-full rounded-full bg-ink px-5 py-2.5 text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingStripeLink ? 'Generating…' : 'Stripe Portal'}
              </button>
            </div>
          )}

          {/* Account Actions */}
          <div className="rounded-2xl border border-hairline p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">Account actions</h2>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-full border border-hairline px-5 py-2.5 text-left text-[15px] font-medium text-ink transition-colors hover:bg-[#FAFAF8]"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => router.push('/new')}
                className="w-full rounded-full border border-hairline px-5 py-2.5 text-left text-[15px] font-medium text-ink transition-colors hover:bg-[#FAFAF8]"
              >
                Create New Reminder
              </button>

              <button
                onClick={logout}
                className="w-full rounded-full border border-[#E7C3B8] px-5 py-2.5 text-left text-[15px] font-medium text-[#B23A1E] transition-colors hover:bg-[#FBF4F1]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
