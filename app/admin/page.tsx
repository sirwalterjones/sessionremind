'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { 
  UserIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  PhoneIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BanknotesIcon,
  SignalIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  username: string
  email: string
  subscription_tier: string
  subscription_status: string
  sms_usage: number
  sms_limit: number
  created_at: string
  is_admin?: boolean
  last_login?: string
  total_spent?: number
}

interface RevenueData {
  monthly: number
  yearly: number
  growth: number
  subscribers: number
  churn: number
  arpu: number
  mrr: number
  ltv: number
}

interface SmsUsageData {
  total: number
  thisMonth: number
  lastMonth: number
  byTier: Record<string, number>
  topUsers: Array<{
    username: string
    email: string
    usage: number
    tier: string
  }>
  dailyUsage: Array<{
    date: string
    usage: number
  }>
}

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'sms' | 'users'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalSmsUsage: 0,
    activeUsers: 0
  })
  const [revenueData, setRevenueData] = useState<RevenueData>({
    monthly: 0,
    yearly: 0,
    growth: 0,
    subscribers: 0,
    churn: 0,
    arpu: 0,
    mrr: 0,
    ltv: 0
  })
  const [smsData, setSmsData] = useState<SmsUsageData>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    byTier: {},
    topUsers: [],
    dailyUsage: []
  })

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!user.is_admin) {
      router.push('/dashboard')
      return
    }

    loadAdminData()
  }, [user, authLoading, router])

  const loadAdminData = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch admin data')
      }

      const data = await response.json()
      setUsers(data.users || [])
      setStats(data.stats || {
        totalUsers: 0,
        totalRevenue: 0,
        totalSmsUsage: 0,
        activeUsers: 0
      })
      
      // Generate mock revenue data based on actual user data
      const mockRevenueData: RevenueData = {
        monthly: data.stats?.totalRevenue || 0,
        yearly: (data.stats?.totalRevenue || 0) * 12,
        growth: 15.3,
        subscribers: data.users?.filter((u: User) => !u.is_admin).length || 0,
        churn: 5.2,
        arpu: data.stats?.totalRevenue > 0 ? (data.stats.totalRevenue / Math.max(1, data.users?.filter((u: User) => !u.is_admin).length || 1)) : 20,
        mrr: data.stats?.totalRevenue || 0,
        ltv: (data.stats?.totalRevenue || 20) * 24 // 2 years average
      }
      setRevenueData(mockRevenueData)
      
      // Generate mock SMS data
      const totalSms = data.stats?.totalSmsUsage || 0
      const mockSmsData: SmsUsageData = {
        total: totalSms,
        thisMonth: Math.floor(totalSms * 0.3),
        lastMonth: Math.floor(totalSms * 0.25),
        byTier: {
          'starter': Math.floor(totalSms * 0.4),
          'pro': Math.floor(totalSms * 0.45),
          'enterprise': Math.floor(totalSms * 0.15)
        },
        topUsers: data.users?.filter((u: User) => !u.is_admin)
          .sort((a: User, b: User) => b.sms_usage - a.sms_usage)
          .slice(0, 5)
          .map((u: User) => ({
            username: u.username,
            email: u.email,
            usage: u.sms_usage,
            tier: u.subscription_tier
          })) || [],
        dailyUsage: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usage: Math.floor(Math.random() * 100) + 50
        }))
      }
      setSmsData(mockSmsData)
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to load admin data:', error)
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'starter':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user?.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔧</span>
              <span className="text-xl font-bold text-gray-900">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
              <span className="text-sm text-gray-600">Admin: {user.username}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 bg-stone-100 text-stone-700 font-medium rounded-full hover:bg-stone-200 transition-all duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BanknotesIcon className="h-5 w-5 inline mr-2" />
              Revenue Analytics
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SignalIcon className="h-5 w-5 inline mr-2" />
              SMS Usage Reports
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-5 w-5 inline mr-2" />
              User Management
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
                Manage users, monitor usage, and track revenue across your SaaS platform
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Platform users</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <CreditCardIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-gray-500 mt-1">Recurring revenue</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <PhoneIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">SMS Usage</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSmsUsage.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Messages sent</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <ChartBarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Users with activity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center mb-4">
                  <BanknotesIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">View detailed revenue and subscription metrics</p>
                <button 
                  onClick={() => setActiveTab('revenue')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Analytics
                </button>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center mb-4">
                  <SignalIcon className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">SMS Usage Reports</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Monitor SMS usage across all tenants</p>
                <button 
                  onClick={() => setActiveTab('sms')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Reports
                </button>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center mb-4">
                  <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Add, edit, or manage user accounts</p>
                <button 
                  onClick={() => setActiveTab('users')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Analytics Tab */}
        {activeTab === 'revenue' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
              <p className="text-gray-600">Track revenue growth, subscriptions, and financial metrics</p>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                             <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                 <div className="flex items-center justify-between mb-2">
                   <p className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</p>
                   <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                 </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueData.mrr)}</p>
                <p className="text-xs text-green-600 mt-1">+{revenueData.growth}% from last month</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Annual Revenue</p>
                  <BanknotesIcon className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueData.yearly)}</p>
                <p className="text-xs text-gray-500 mt-1">Projected annual</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Active Subscribers</p>
                  <UserIcon className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{revenueData.subscribers}</p>
                <p className="text-xs text-gray-500 mt-1">Paying customers</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Average Revenue Per User</p>
                  <CreditCardIcon className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueData.arpu)}</p>
                <p className="text-xs text-gray-500 mt-1">Monthly ARPU</p>
              </div>
            </div>

            {/* Revenue Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(revenueData.ltv)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Churn Rate</span>
                    <span className="text-sm font-medium text-red-600">{revenueData.churn}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Growth Rate</span>
                    <span className="text-sm font-medium text-green-600">+{revenueData.growth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue per SMS</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(stats.totalSmsUsage > 0 ? stats.totalRevenue / stats.totalSmsUsage : 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Breakdown</h3>
                <div className="space-y-3">
                  {['Enterprise', 'Pro', 'Starter'].map((tier) => {
                    const tierUsers = users.filter(u => u.subscription_tier?.toLowerCase() === tier.toLowerCase() && !u.is_admin)
                    const tierRevenue = tierUsers.length * (tier === 'Enterprise' ? 50 : tier === 'Pro' ? 30 : 20)
                    return (
                      <div key={tier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{tier}</p>
                          <p className="text-sm text-gray-500">{tierUsers.length} subscribers</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(tierRevenue)}</p>
                          <p className="text-sm text-gray-500">monthly</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Usage Reports Tab */}
        {activeTab === 'sms' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS Usage Reports</h1>
              <p className="text-gray-600">Monitor SMS usage patterns and analyze communication metrics</p>
            </div>

            {/* SMS Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Total SMS Sent</p>
                  <PhoneIcon className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{smsData.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <CalendarIcon className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{smsData.thisMonth.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{Math.round(((smsData.thisMonth - smsData.lastMonth) / Math.max(smsData.lastMonth, 1)) * 100)}% from last month
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Daily Average</p>
                  <ClockIcon className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(smsData.thisMonth / 30).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Messages per day</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">98.5%</p>
                <p className="text-xs text-gray-500 mt-1">Delivery success</p>
              </div>
            </div>

            {/* SMS Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Subscription Tier</h3>
                <div className="space-y-3">
                  {Object.entries(smsData.byTier).map(([tier, usage]) => (
                    <div key={tier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(tier)} mr-3`}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{usage.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {Math.round((usage / smsData.total) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top SMS Users</h3>
                <div className="space-y-3">
                  {smsData.topUsers.map((user, index) => (
                    <div key={user.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{user.usage.toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(user.tier)}`}>
                          {user.tier}
                        </span>
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
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Manage user accounts, subscriptions, and access levels</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add New User
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Tiers</option>
                  <option>Enterprise</option>
                  <option>Pro</option>
                  <option>Starter</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Cancelled</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SMS Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {userData.username}
                                {userData.is_admin && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{userData.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(userData.subscription_tier)}`}>
                            {userData.subscription_tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userData.subscription_status)}`}>
                            {userData.subscription_status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{userData.sms_usage.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">
                            of {userData.sms_limit === 999999 ? '∞' : userData.sms_limit.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(userData.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedUser(userData)
                                setShowUserModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            {!userData.is_admin && (
                              <button className="text-red-600 hover:text-red-900">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-sm text-gray-900">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.is_admin ? 'Administrator' : 'User'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tier</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(selectedUser.subscription_tier)}`}>
                        {selectedUser.subscription_tier}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.subscription_status)}`}>
                        {selectedUser.subscription_status || 'active'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">SMS Usage</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.sms_usage.toLocaleString()} of {selectedUser.sms_limit === 999999 ? '∞' : selectedUser.sms_limit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Monthly Value</label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(selectedUser.subscription_tier === 'enterprise' ? 50 : selectedUser.subscription_tier === 'pro' ? 30 : 20)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}