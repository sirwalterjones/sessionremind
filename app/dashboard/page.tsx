'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, ClockIcon, PlayIcon, CogIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon, CalendarIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'

interface SentMessage {
  id: string | number
  name: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  status: string
  timestamp: string
  createdAt?: string
  scheduledFor?: string
  sentAt?: string
}

interface ScheduledMessage {
  id: string
  clientName: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  scheduledFor: string
  sessionDate: string
  reminderType: '3-day' | '1-day' | 'registration' | 'manual'
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  createdAt: string
  sentAt?: string
}

interface ClientGroup {
  clientName: string
  phone: string
  sessionTitle: string
  sessionTime: string
  messages: (ScheduledMessage | SentMessage)[]
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduledCount, setScheduledCount] = useState(0)
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cancellingMessages, setCancellingMessages] = useState<Set<string>>(new Set())
  const [cancelledMessages, setCancelledMessages] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

  useEffect(() => {
    // Check payment status from URL (simplified for Professional Plan)
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      console.log('Payment successful!')
    }
    
    if (user) {
      loadAllData()
    } else {
      setLoading(false)
    }
  }, [user, searchParams])


  const loadAllData = async () => {
    setLoading(true)
    try {
      // Professional Plan - all authenticated users have access
      // No subscription checks needed
      
      // Load sent messages from localStorage (user-specific)
      if (user) {
        const userKey = `sentMessages_${user.id}`
        const stored = localStorage.getItem(userKey)
        if (stored) {
          setSentMessages(JSON.parse(stored))
        }
        
        // For admin user, also load legacy data if exists
        if (user.is_admin) {
          const legacyStored = localStorage.getItem('sentMessages')
          if (legacyStored) {
            const legacyMessages = JSON.parse(legacyStored)
            // Migrate legacy messages to admin user
            localStorage.setItem(userKey, JSON.stringify(legacyMessages))
            localStorage.removeItem('sentMessages') // Clean up old data
            setSentMessages(legacyMessages)
          }
        }
      }

      // Load scheduled messages from API
      await loadScheduledMessages()
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadScheduledMessages = async () => {
    try {
      const response = await fetch('/api/schedule-reminders')
      if (response.ok) {
        const data = await response.json()
        const messages = data.scheduledMessages || []
        setScheduledMessages(messages)
        setScheduledCount(messages.filter((msg: ScheduledMessage) => msg.status === 'scheduled').length)
        
        // Group messages by client (combine scheduled and sent messages)
        const groups = groupMessagesByClient(messages, sentMessages)
        setClientGroups(groups)
      }
    } catch (error) {
      console.error('Failed to load scheduled messages:', error)
    }
  }

  const groupMessagesByClient = (scheduledMessages: ScheduledMessage[], sentMessages: SentMessage[]): ClientGroup[] => {
    const grouped = {} as Record<string, ClientGroup>
    
    // Process scheduled messages
    scheduledMessages.forEach(message => {
      const key = message.clientName.toLowerCase().trim()
      if (!grouped[key]) {
        grouped[key] = {
          clientName: message.clientName,
          phone: message.phone,
          sessionTitle: message.sessionTitle || 'Photography Session',
          sessionTime: message.sessionTime || message.sessionDate || '',
          messages: []
        }
      } else {
        // Update with better data if current is empty/invalid
        if (!grouped[key].sessionTitle || grouped[key].sessionTitle === 'Photography Session') {
          grouped[key].sessionTitle = message.sessionTitle || grouped[key].sessionTitle
        }
        if (!grouped[key].sessionTime) {
          grouped[key].sessionTime = message.sessionTime || message.sessionDate || grouped[key].sessionTime
        }
        // Keep the primary phone number (usually from scheduled messages)
        if (!grouped[key].phone || grouped[key].phone.length < 10) {
          grouped[key].phone = message.phone
        }
      }
      grouped[key].messages.push(message)
    })
    
    // Process sent messages (registration and manual)
    sentMessages.forEach(message => {
      const key = message.name.toLowerCase().trim()
      if (!grouped[key]) {
        grouped[key] = {
          clientName: message.name,
          phone: message.phone,
          sessionTitle: message.sessionTitle || 'Photography Session',
          sessionTime: message.sessionTime || '',
          messages: []
        }
      } else {
        // Update with better data if current is empty/invalid
        if (!grouped[key].sessionTitle || grouped[key].sessionTitle === 'Photography Session') {
          grouped[key].sessionTitle = message.sessionTitle || grouped[key].sessionTitle
        }
        if (!grouped[key].sessionTime) {
          grouped[key].sessionTime = message.sessionTime || grouped[key].sessionTime
        }
        // Keep the primary phone number (prefer longer/more complete numbers)
        if (!grouped[key].phone || grouped[key].phone.length < message.phone.length) {
          grouped[key].phone = message.phone
        }
      }
      
      // Convert SentMessage to match ScheduledMessage format for display
      const convertedMessage = {
        id: message.id.toString(),
        clientName: message.name,
        phone: message.phone,
        email: message.email,
        sessionTitle: message.sessionTitle,
        sessionTime: message.sessionTime,
        message: message.message,
        scheduledFor: message.timestamp,
        sessionDate: message.sessionTime,
        reminderType: message.status.includes('Registration') ? 'registration' as const : 'manual' as const,
        status: message.status.includes('Sent') ? 'sent' as const : 'scheduled' as const,
        createdAt: message.timestamp,
        sentAt: message.status.includes('Sent') ? message.timestamp : undefined
      }
      
      grouped[key].messages.push(convertedMessage)
    })

    return Object.values(grouped).sort((a, b) => {
      const aLatest = Math.max(...a.messages.map(m => new Date(m.createdAt || (m as SentMessage).timestamp || 0).getTime()))
      const bLatest = Math.max(...b.messages.map(m => new Date(m.createdAt || (m as SentMessage).timestamp || 0).getTime()))
      return bLatest - aLatest
    })
  }



  const cancelMessage = async (messageId: string) => {
    try {
      // Add to cancelling state
      setCancellingMessages(prev => new Set(prev).add(messageId))
      
      const response = await fetch(`/api/cancel-message/${messageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from cancelling state and add to cancelled state
        setCancellingMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
        setCancelledMessages(prev => new Set(prev).add(messageId))
        
        // Update the selectedClient state to reflect the cancellation
        if (selectedClient) {
          const updatedMessages = selectedClient.messages.map(msg => 
            msg.id === messageId ? { ...msg, status: 'cancelled' as const } : msg
          )
          setSelectedClient({
            ...selectedClient,
            messages: updatedMessages
          })
        }
        
        // Reload data to reflect cancellation in the main view
        await loadScheduledMessages()
        
        // Auto-hide the success state after 3 seconds
        setTimeout(() => {
          setCancelledMessages(prev => {
            const newSet = new Set(prev)
            newSet.delete(messageId)
            return newSet
          })
        }, 3000)
      }
    } catch (error) {
      console.error('Error cancelling message:', error)
      // Remove from cancelling state on error
      setCancellingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  const openClientModal = (client: ClientGroup) => {
    setSelectedClient(client)
    setShowClientModal(true)
    // Clear any lingering cancelled/cancelling states
    setCancelledMessages(new Set())
    setCancellingMessages(new Set())
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Not specified'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return the original string
        return dateString
      }
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      return dateString || 'Invalid date'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <ClockIcon className="h-4 w-4 text-amber-500" />
      case 'sent': return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
      case 'failed': return <XMarkIcon className="h-4 w-4 text-red-500" />
      case 'cancelled': return <XMarkIcon className="h-4 w-4 text-gray-500" />
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'sent': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200'
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // Helper function to check if a session has passed
  const isSessionPassed = (sessionTime: string, sessionDate?: string) => {
    try {
      // Use sessionDate (ISO string) if available, otherwise try to parse sessionTime
      const dateToCheck = sessionDate ? new Date(sessionDate) : parseSessionDate(sessionTime)
      if (!dateToCheck) return false
      
      const now = new Date()
      return dateToCheck < now
    } catch {
      return false
    }
  }

  // Parse session date with robust parsing (similar to schedule API)
  const parseSessionDate = (sessionTime: string): Date | null => {
    try {
      // Clean up the input string
      let dateStr = sessionTime.trim()
      
      // Try multiple parsing strategies
      const strategies = [
        // Strategy 1: Direct parsing with cleanup
        () => {
          let cleaned = dateStr.toLowerCase()
          // Remove ordinals
          cleaned = cleaned.replace(/(\d+)(st|nd|rd|th)/g, '$1')
          // Remove day of week
          cleaned = cleaned.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i, '')
          // Handle time ranges
          cleaned = cleaned.replace(/(\d{1,2}:\d{2}\s*(am|pm))\s*-\s*\d{1,2}:\d{2}\s*(am|pm)/i, '$1')
          // Replace " at " with space
          cleaned = cleaned.replace(/ at /g, ' ')
          return new Date(cleaned)
        },
        
        // Strategy 2: Manual parsing for common formats
        () => {
          // Match: "July 10th, 2025 at 2:00 PM"
          const match = dateStr.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})\s+(?:at\s+)?(\d{1,2}):(\d{2})\s*(AM|PM)/i)
          if (match) {
            const [, month, day, year, hour, minute, ampm] = match
            const date = new Date(`${month} ${day}, ${year} ${hour}:${minute} ${ampm}`)
            return date
          }
          return null
        },
        
        // Strategy 3: Try with just date part if time parsing fails
        () => {
          const datePart = dateStr.split(' at ')[0] || dateStr.split(/\d{1,2}:\d{2}/)[0]
          if (datePart) {
            let cleaned = datePart.replace(/(\d+)(st|nd|rd|th)/g, '$1')
            cleaned = cleaned.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s*/i, '')
            const date = new Date(cleaned + ' 12:00 PM') // Default to noon
            return date
          }
          return null
        },
        
        // Strategy 4: Try original string with minimal cleanup
        () => {
          const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1')
          return new Date(cleaned)
        }
      ]
      
      for (let i = 0; i < strategies.length; i++) {
        try {
          const result = strategies[i]()
          if (result && !isNaN(result.getTime()) && result.getFullYear() > 2020) {
            return result
          }
        } catch (e) {
          // Continue to next strategy
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Filter clients by active/archived status
  const filteredByStatus = clientGroups.filter(client => {
    // Try to get sessionDate from the first message if available
    const firstMessage = client.messages[0]
    const sessionDate = firstMessage && 'sessionDate' in firstMessage ? firstMessage.sessionDate : undefined
    const sessionPassed = isSessionPassed(client.sessionTime, sessionDate)
    return activeTab === 'active' ? !sessionPassed : sessionPassed
  })

  const filteredClients = filteredByStatus.filter(client => 
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Count active and archived clients
  const activeClientsCount = clientGroups.filter(client => {
    const firstMessage = client.messages[0]
    const sessionDate = firstMessage && 'sessionDate' in firstMessage ? firstMessage.sessionDate : undefined
    return !isSessionPassed(client.sessionTime, sessionDate)
  }).length
  const archivedClientsCount = clientGroups.filter(client => {
    const firstMessage = client.messages[0]
    const sessionDate = firstMessage && 'sessionDate' in firstMessage ? firstMessage.sessionDate : undefined
    return isSessionPassed(client.sessionTime, sessionDate)
  }).length

  // Calculate analytics
  const totalMessages = scheduledMessages.length
  const sentCount = scheduledMessages.filter(msg => msg.status === 'sent').length
  const failedCount = scheduledMessages.filter(msg => msg.status === 'failed').length
  const deliveryRate = totalMessages > 0 ? ((sentCount / totalMessages) * 100).toFixed(1) : '0'
  const estimatedCost = (sentCount * 0.049).toFixed(2) // $0.049 per SMS based on TextMagic pricing
  const uniqueClients = new Set(scheduledMessages.map(msg => `${msg.clientName}-${msg.phone}`)).size

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600">Please log in to access your dashboard</p>
            </div>
            
            <div className="space-y-4">
              <a
                href="/login"
                className="w-full bg-stone-800 text-white py-3 px-4 rounded-full font-medium hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md text-center block"
              >
                Go to Login
              </a>
              <a
                href="/register"
                className="w-full bg-white text-stone-800 py-3 px-4 rounded-full font-medium border border-stone-200 hover:bg-stone-50 transition-all duration-200 shadow-sm hover:shadow-md text-center block"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Note: Since we're using a single Professional Plan, all authenticated users get access
  // Subscription check removed - all users who can log in have access to the dashboard

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-stone-200 rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-stone-200 rounded-xl w-1/3 mx-auto mb-2"></div>
              <div className="h-4 bg-stone-200 rounded-lg w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-stone-200 rounded-lg mb-2"></div>
                  <div className="h-8 bg-stone-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <span className="text-xl font-bold text-gray-900">Session Remind</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              {user.is_admin && (
                <>
                  <a
                    href="/admin"
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 font-medium rounded-full hover:bg-purple-200 transition-all duration-200 text-sm"
                  >
                    Admin Console
                  </a>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                  </span>
                </>
              )}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-6">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            SMS Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
            Track your session reminders and client communications with ease
          </p>
          <div className="flex justify-center">
            <a
              href="/new"
              className="inline-flex items-center px-8 py-4 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Reminder
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-emerald-600 text-xl">📤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Messages Sent</p>
                <p className="text-3xl font-bold text-gray-900">{sentCount}</p>
                <p className="text-xs text-gray-500 mt-1">{totalMessages} total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Delivery Rate</p>
                <p className="text-3xl font-bold text-gray-900">{deliveryRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {failedCount > 0 ? `${failedCount} failed` : 'No failures'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">SMS Cost</p>
                <p className="text-3xl font-bold text-gray-900">${estimatedCost}</p>
                <p className="text-xs text-gray-500 mt-1">$0.049/message</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-amber-600 text-xl">⏰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-gray-900">{scheduledCount}</p>
                <p className="text-xs text-gray-500 mt-1">{uniqueClients} clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="mb-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-stone-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeTab === 'active'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Active ({activeClientsCount})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeTab === 'archived'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Archived ({archivedClientsCount})
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} clients, phone numbers, or session types...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-full focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Client Groups */}
        <div>
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm border border-stone-100 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
                {searchTerm ? <MagnifyingGlassIcon className="h-10 w-10 text-stone-400" /> : <ClockIcon className="h-10 w-10 text-stone-400" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm 
                  ? 'No matching clients found' 
                  : activeTab === 'active' 
                    ? 'No active reminders' 
                    : 'No archived sessions yet'
                }
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm 
                  ? 'Try adjusting your search terms or check the spelling.'
                  : activeTab === 'active'
                    ? 'Start sending personalized SMS reminders to your photography clients and keep track of them here.'
                    : 'Sessions will automatically appear here after their scheduled date has passed.'
                }
              </p>
              {!searchTerm && (
                <a
                  href="/new"
                  className="inline-flex items-center px-8 py-4 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="mr-3 text-xl">🚀</span>
                  <span className="text-lg">Create Your First Reminder</span>
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-stone-600 text-sm font-bold">{filteredClients.length}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {searchTerm 
                      ? `Search Results` 
                      : activeTab === 'active' 
                        ? 'Active Client Reminders' 
                        : 'Archived Sessions'
                    }
                  </h2>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-stone-600 hover:text-stone-800 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
              
              {filteredClients.map((client) => {
                const scheduledMessages = client.messages.filter(msg => msg.status === 'scheduled')
                const sentMessages = client.messages.filter(msg => msg.status === 'sent')
                const failedMessages = client.messages.filter(msg => msg.status === 'failed')
                const cancelledMessages = client.messages.filter(msg => msg.status === 'cancelled')
                
                // Group sent messages by type
                const registrationMessages = sentMessages.filter(msg => 'reminderType' in msg && msg.reminderType === 'registration')
                const manualMessages = sentMessages.filter(msg => 'reminderType' in msg && msg.reminderType === 'manual')
                const reminderMessages = sentMessages.filter(msg => 'reminderType' in msg && msg.reminderType !== 'registration' && msg.reminderType !== 'manual')
                
                // Check if session has passed
                const firstMessage = client.messages[0]
                const sessionDate = firstMessage && 'sessionDate' in firstMessage ? firstMessage.sessionDate : undefined
                const sessionPassed = isSessionPassed(client.sessionTime, sessionDate)
                
                return (
                  <div 
                    key={`${client.clientName}-${client.phone}`} 
                    className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 cursor-pointer ${
                      sessionPassed 
                        ? 'border-stone-200 opacity-75 hover:opacity-100 hover:shadow-md' 
                        : 'border-stone-100 hover:shadow-md'
                    }`}
                    onClick={() => openClientModal(client)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
                          <span className="text-stone-600 text-xl">👤</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xl font-bold text-gray-900">{client.clientName}</h4>
                            {sessionPassed && (
                              <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">
                                ARCHIVED
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col text-gray-600 text-sm space-y-1">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {client.phone}
                            </div>
                            {client.messages[0]?.email && (
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-1">📧</span>
                                {client.messages[0].email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">{client.messages.length} message{client.messages.length !== 1 ? 's' : ''}</div>
                        <div className="flex gap-1 flex-wrap">
                          {registrationMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📧 {registrationMessages.length} registration
                            </span>
                          )}
                          {manualMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              💬 {manualMessages.length} manual
                            </span>
                          )}
                          {reminderMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              ⏰ {reminderMessages.length} reminder{reminderMessages.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {scheduledMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              ⏳ {scheduledMessages.length} scheduled
                            </span>
                          )}
                          {failedMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ {failedMessages.length} failed
                            </span>
                          )}
                          {cancelledMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              🚫 {cancelledMessages.length} cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                        <p className="text-xs font-medium text-stone-600 mb-1">📸 Session Type</p>
                        <p className="text-stone-800 font-medium text-sm">{client.sessionTitle || 'Photography Session'}</p>
                      </div>
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                        <p className="text-xs font-medium text-stone-600 mb-1">📅 Session Date</p>
                        <p className="text-stone-800 font-medium text-sm">{formatDate(client.sessionTime)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Created {formatDate(client.messages[0]?.createdAt || (client.messages[0] as SentMessage)?.timestamp || '')}</span>
                      </div>
                      <span className="text-stone-600 font-medium">Click to view details →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>


        {/* Client Detail Modal */}
        {showClientModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-stone-600 text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedClient.clientName}</h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {selectedClient.phone}
                        {selectedClient.messages[0]?.email && (
                          <>
                            <span className="mx-2">•</span>
                            <span>📧 {selectedClient.messages[0].email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClientModal(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-stone-600 mb-1">📸 Session Type</p>
                    <p className="text-stone-800 font-medium">{selectedClient.sessionTitle || 'Photography Session'}</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-stone-600 mb-1">📅 Session Date</p>
                    <p className="text-stone-800 font-medium">{formatDate(selectedClient.sessionTime)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Message Timeline</h4>
                
                <div className="space-y-4">
                  {selectedClient.messages
                    .sort((a, b) => new Date(a.createdAt || a.scheduledFor || (a as SentMessage).timestamp || 0).getTime() - new Date(b.createdAt || b.scheduledFor || (b as SentMessage).timestamp || 0).getTime())
                    .map((message) => (
                    <div key={message.id} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getStatusIcon(message.status)}
                          <div className="ml-3">
                            <h5 className="font-semibold text-gray-900">
                              {'reminderType' in message && message.reminderType === 'registration' && '📧 Registration Confirmation'}
                              {'reminderType' in message && message.reminderType === 'manual' && '💬 Manual Message'}
                              {'reminderType' in message && message.reminderType === '3-day' && '⏰ 3-Day Reminder'}
                              {'reminderType' in message && message.reminderType === '1-day' && '⏰ 1-Day Reminder'}
                              {!('reminderType' in message) && '📅 Scheduled Reminder'}
                            </h5>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-4">
                                {'reminderType' in message && (message.reminderType === 'registration' || message.reminderType === 'manual') ? (
                                  <span>✅ Sent: {formatDate(message.scheduledFor || '')}</span>
                                ) : (
                                  <>
                                    <span>🕒 Scheduled: {formatDate(message.scheduledFor || '')}</span>
                                    {message.sentAt && (
                                      <span>✅ Sent: {formatDate(message.sentAt)}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                          {message.status === 'scheduled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelMessage(message.id.toString())
                              }}
                              disabled={cancellingMessages.has(message.id.toString())}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                cancelledMessages.has(message.id.toString())
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : cancellingMessages.has(message.id.toString())
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {cancelledMessages.has(message.id.toString())
                                ? '✓ Cancelled'
                                : cancellingMessages.has(message.id.toString())
                                ? 'Cancelling...'
                                : 'Cancel'}
                            </button>
                          )}
                          {message.status === 'cancelled' && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white border border-stone-100 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-800 mb-2">💬 Message Content</p>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          "{message.message || 'No message content stored'}"
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>Created: {formatDate(message.createdAt || (message as SentMessage).timestamp || message.scheduledFor || '')}</span>
                        <span>ID: {message.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}