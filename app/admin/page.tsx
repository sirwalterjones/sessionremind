'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GiftIcon,
  CreditCardIcon,
  LinkIcon,
  KeyIcon
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

interface AdminData {
  users: User[]
  stats: {
    totalUsers: number
    totalRevenue: number
    totalSmsUsage: number
    activeUsers: number
    subscriberCount: number
    paidSubscribers: number
    overrideUsers: number
    averageRevenuePerUser: number
    estimatedAnnualRevenue: number
  }
  analytics: {
    subscriptionBreakdown: Record<string, number>
    smsUsageByTier: Record<string, number>
    topSmsUsers: Array<{
      id: string
      username: string
      email: string
      sms_usage: number
      subscription_tier: string
    }>
    revenueMetrics: {
      monthlyRecurringRevenue: number
      annualRecurringRevenue: number
      averageRevenuePerUser: number
      customerLifetimeValue: number
      monthlyGrowthRate: number
      churnRate: number
    }
    smsMetrics: {
      totalSent: number
      thisMonth: number
      lastMonth: number
      dailyAverage: number
      successRate: number
      byTier: Record<string, number>
    }
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'sms' | 'users'>('analytics')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [filterTier, setFilterTier] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    subscription_tier: 'professional',
    subscription_status: 'active',
    is_admin: false,
    payment_override: false,
    stripe_customer_id: '',
    sms_limit: 500
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch admin data')
      }
      const adminData = await response.json()
      setData(adminData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      await fetchAdminData()
      setShowUserModal(false)
      resetForm()
      showNotification('success', 'User created successfully!')
    } catch (error) {
      console.error('Error creating user:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      await fetchAdminData()
      setShowUserModal(false)
      resetForm()
      showNotification('success', 'User updated successfully!')
    } catch (error) {
      console.error('Error updating user:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/admin/users?userId=${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      await fetchAdminData()
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      showNotification('success', 'User deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const handleTogglePaymentOverride = async (user: User) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          payment_override: !user.payment_override,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update payment override')
      }

      await fetchAdminData()
      const action = !user.payment_override ? 'granted' : 'revoked'
      showNotification('success', `Payment override ${action} for ${user.username}!`)
    } catch (error) {
      console.error('Error toggling payment override:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to update payment override')
    }
  }

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return

    setIsResettingPassword(true)
    
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToResetPassword.id,
          newPassword: newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset password')
      }

      setShowPasswordReset(false)
      setUserToResetPassword(null)
      setNewPassword('')
      showNotification('success', `Password reset successfully for ${userToResetPassword.username}!`)
    } catch (error) {
      console.error('Error resetting password:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const openCreateModal = () => {
    setIsCreating(true)
    setSelectedUser(null)
    resetForm()
    setShowUserModal(true)
  }

  const openEditModal = (user: User) => {
    setIsCreating(false)
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      subscription_tier: user.subscription_tier,
      subscription_status: user.subscription_status,
      is_admin: user.is_admin,
      payment_override: user.payment_override,
      stripe_customer_id: user.stripe_customer_id || '',
      sms_limit: user.sms_limit
    })
    setShowUserModal(true)
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const openPasswordResetModal = (user: User) => {
    setUserToResetPassword(user)
    setNewPassword('')
    setShowPasswordReset(true)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      subscription_tier: 'professional',
      subscription_status: 'active',
      is_admin: false,
      payment_override: false,
      stripe_customer_id: '',
      sms_limit: 500
    })
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const filteredUsers = data?.users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = !filterTier || user.subscription_tier === filterTier
    const matchesStatus = !filterStatus || user.subscription_status === filterStatus
    return matchesSearch && matchesTier && matchesStatus
  }) || []

  const getSubscriptionColor = (tier: string) => {
    // All users are on Professional Plan
    return 'bg-blue-100 text-blue-800'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">No data available</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your application and users</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </button>
            </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Revenue Analytics
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />
              SMS Reports
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserIcon className="h-5 w-5 inline mr-2" />
              User Management
            </button>
          </nav>
        </div>

        {/* Revenue Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${data.analytics.revenueMetrics.monthlyRecurringRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Paid Subscribers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.stats.paidSubscribers.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      +{data.stats.overrideUsers} override users
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      +{data.analytics.revenueMetrics.monthlyGrowthRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <GiftIcon className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Override Users</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.stats.overrideUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Admin granted access
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Revenue Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Recurring Revenue</span>
                    <span className="font-semibold text-gray-900">${data.analytics.revenueMetrics.annualRecurringRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Revenue Per User</span>
                    <span className="font-semibold text-gray-900">${data.analytics.revenueMetrics.averageRevenuePerUser.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Lifetime Value</span>
                    <span className="font-semibold text-gray-900">${data.analytics.revenueMetrics.customerLifetimeValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Churn Rate</span>
                    <span className="font-semibold text-gray-900">{data.analytics.revenueMetrics.churnRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Tiers</h3>
                <div className="space-y-3">
                  {Object.entries(data.analytics.subscriptionBreakdown).map(([tier, count]) => (
                    <div key={tier} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                          PROFESSIONAL
                        </span>
                        <span className="ml-2 text-gray-600">{count} users</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(20 * (count as number)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Reports Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
            {/* SMS Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total SMS Sent</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.analytics.smsMetrics.totalSent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.analytics.smsMetrics.thisMonth.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.analytics.smsMetrics.lastMonth === 0 
                        ? 'No previous data' 
                        : `${Math.round(((data.analytics.smsMetrics.thisMonth - data.analytics.smsMetrics.lastMonth) / data.analytics.smsMetrics.lastMonth) * 100) >= 0 ? '+' : ''}${Math.round(((data.analytics.smsMetrics.thisMonth - data.analytics.smsMetrics.lastMonth) / data.analytics.smsMetrics.lastMonth) * 100)}% vs last month`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.analytics.smsMetrics.totalSent === 0 
                        ? 'No data' 
                        : `${data.analytics.smsMetrics.successRate}%`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Daily Average</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.analytics.smsMetrics.dailyAverage.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Usage by Tier and Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Subscription Tier</h3>
                <div className="space-y-3">
                  {Object.entries(data.analytics.smsUsageByTier).map(([tier, usage]) => (
                    <div key={tier} className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSubscriptionColor(tier)}`}>
                        PROFESSIONAL
                      </span>
                      <span className="font-semibold text-gray-900">{(usage as number).toLocaleString()} SMS</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 SMS Users</h3>
                <div className="space-y-2">
                  {data.analytics.topSmsUsers.map((user, index) => (
                    <div key={user.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{user.sms_usage.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">professional</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage user accounts and subscriptions</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/fix-user-tiers', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      })
                      const result = await response.json()
                      if (result.success) {
                        showNotification('success', result.message)
                        fetchAdminData() // Refresh data
                      } else {
                        showNotification('error', result.error)
                      }
                    } catch (error) {
                      showNotification('error', 'Failed to fix user tiers')
                    }
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                >
                  <span className="text-xs">🔧</span>
                  <span className="ml-2">Fix Tiers</span>
                </button>
                <button
                  onClick={openCreateModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create User
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Tiers</option>
                  <option value="professional">Professional</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SMS Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {user.username}
                                {user.is_admin && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(user.subscription_tier)}`}>
                            PROFESSIONAL
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.sms_usage.toLocaleString()} / {user.sms_limit === 999999 ? '∞' : user.sms_limit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.subscription_status)}`}>
                            {user.subscription_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.payment_override ? (
                              <div className="flex items-center text-orange-600">
                                <GiftIcon className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">Override</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-green-600">
                                <CreditCardIcon className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">Paid</span>
                              </div>
                            )}
                          </div>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex items-center justify-end space-x-2">
                             {user.stripe_customer_id && !user.payment_override && (
                               <button
                                 onClick={() => window.open(`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`, '_blank')}
                                 className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                                 title="View in Stripe Dashboard"
                               >
                                 <LinkIcon className="h-4 w-4" />
                               </button>
                             )}
                             <button
                               onClick={() => handleTogglePaymentOverride(user)}
                               className={`p-2 rounded-lg transition-colors ${
                                 user.payment_override
                                   ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                   : 'bg-green-100 text-green-600 hover:bg-green-200'
                               }`}
                               title={user.payment_override ? 'Remove payment override' : 'Grant payment override'}
                             >
                               {user.payment_override ? (
                                 <CreditCardIcon className="h-4 w-4" />
                               ) : (
                                 <GiftIcon className="h-4 w-4" />
                               )}
                             </button>
                             <button
                               onClick={() => openPasswordResetModal(user)}
                               className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                               title="Reset password"
                             >
                               <KeyIcon className="h-4 w-4" />
                             </button>
                             <button
                               onClick={() => openEditModal(user)}
                               className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                               title="Edit user"
                             >
                               <PencilIcon className="h-4 w-4" />
                             </button>
                             <button
                               onClick={() => openDeleteModal(user)}
                               className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                               title="Delete user"
                             >
                               <TrashIcon className="h-4 w-4" />
                             </button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New User' : 'Edit User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              isCreating ? handleCreateUser() : handleUpdateUser()
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                </div>

                {isCreating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={formData.subscription_tier}
                    onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Subscription Status
                  </label>
                  <select
                    value={formData.subscription_status}
                    onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    SMS Limit
                  </label>
                  <input
                    type="number"
                    value={formData.sms_limit}
                    onChange={(e) => setFormData({ ...formData, sms_limit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Stripe Customer ID
                  </label>
                  <input
                    type="text"
                    value={formData.stripe_customer_id}
                    onChange={(e) => setFormData({ ...formData, stripe_customer_id: e.target.value })}
                    placeholder="cus_xxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Link to Stripe customer (for paid users)
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Admin User</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.payment_override}
                      onChange={(e) => setFormData({ ...formData, payment_override: e.target.checked })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Payment Override</span>
                  </label>
                </div>

                {formData.payment_override && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <GiftIcon className="h-5 w-5 text-orange-600 mr-2" />
                      <p className="text-sm text-orange-800">
                        This user will have premium access without payment requirements.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 border border-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border border-blue-600 font-medium shadow-sm"
                >
                  {isCreating ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-900 mb-6">
              Are you sure you want to delete the user <strong className="text-gray-900">{userToDelete.username}</strong>? 
              This action cannot be undone and will permanently remove all user data.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 border border-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 border border-red-600 font-medium shadow-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && userToResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <KeyIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordReset(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-900 mb-4">
                Reset password for user <strong className="text-gray-900">{userToResetPassword.username}</strong> ({userToResetPassword.email})
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordReset(false)}
                className="px-4 py-2 text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 border border-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword || newPassword.length < 8 || isResettingPassword}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-600 font-medium shadow-sm"
              >
                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}