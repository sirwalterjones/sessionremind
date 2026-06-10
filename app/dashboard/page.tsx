'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'
import { DashboardSetupStatus } from '@/components/SetupStatus'
import {
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

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
  reminderType: '3-day' | '1-day' | 'registration' | 'manual' | 'test-2min' | 'test-5min'
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  createdAt: string
  sentAt?: string
  userId?: string
}

interface ClientGroup {
  clientName: string
  phone: string
  sessionTitle: string
  sessionTime: string
  messages: (ScheduledMessage | SentMessage)[]
}

export default function Dashboard() {
  // useSearchParams must be inside a Suspense boundary (Next.js 14 requirement).
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
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
  // Inline editing of a scheduled reminder (message text + send time).
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editWhen, setEditWhen] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
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
      
      // Load all messages from persistent storage (includes both scheduled and sent messages)
      const persistentMessages = await loadScheduledMessages()
      
      // For backwards compatibility, still load localStorage data but merge it
      if (user) {
        const userKey = `sentMessages_${user.id}`
        const stored = localStorage.getItem(userKey)
        if (stored) {
          const localMessages = JSON.parse(stored)
          setSentMessages(prev => {
            // Only add localStorage messages that aren't already in persistent storage
            const existingIds = new Set((persistentMessages || []).map(msg => msg.id))
            const uniqueLocalMessages = localMessages.filter((msg: any) => !existingIds.has(msg.id))
            return [...prev, ...uniqueLocalMessages]
          })
        }
        
        // For admin user, also load legacy data if exists
        if (user.is_admin) {
          const legacyStored = localStorage.getItem('sentMessages')
          if (legacyStored) {
            const legacyMessages = JSON.parse(legacyStored)
            // Migrate legacy messages to admin user
            localStorage.setItem(userKey, JSON.stringify(legacyMessages))
            localStorage.removeItem('sentMessages') // Clean up old data
            setSentMessages(prev => {
              const existingIds = new Set([...scheduledMessages.map(msg => msg.id), ...prev.map((msg: any) => msg.id)])
              const uniqueLegacyMessages = legacyMessages.filter((msg: any) => !existingIds.has(msg.id))
              return [...prev, ...uniqueLegacyMessages]
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadScheduledMessages = async (): Promise<ScheduledMessage[]> => {
    try {
      const response = await fetch('/api/schedule-reminders')
      if (response.ok) {
        const data = await response.json()
        const messages = data.scheduledMessages || []
        setScheduledMessages(messages)
        setScheduledCount(messages.filter((msg: ScheduledMessage) => msg.status === 'scheduled').length)
        
        console.log(`📊 Loaded ${messages.length} messages for user:`, messages.map((m: ScheduledMessage) => ({ 
          id: m.id, 
          client: m.clientName, 
          type: m.reminderType, 
          status: m.status,
          userId: m.userId 
        })))
        
        // Group messages by client - messages now include both scheduled and sent
        const groups = groupMessagesByClient(messages, [])
        setClientGroups(groups)
        
        return messages
      }
      return []
    } catch (error) {
      console.error('Failed to load scheduled messages:', error)
      return []
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

  // Convert a stored ISO/date string into the value a <input type="datetime-local">
  // expects (YYYY-MM-DDTHH:mm) in the viewer's local time.
  const toLocalInput = (value: string): string => {
    const d = new Date(value)
    if (isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const startEdit = (message: ScheduledMessage | SentMessage) => {
    setEditError('')
    setEditingId(message.id.toString())
    setEditText(message.message || '')
    setEditWhen(toLocalInput(message.scheduledFor || ''))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditError('')
  }

  const saveEdit = async (messageId: string) => {
    setEditError('')
    if (!editText.trim()) {
      setEditError('Message text cannot be empty.')
      return
    }
    const when = editWhen ? new Date(editWhen) : null
    if (editWhen && isNaN(when!.getTime())) {
      setEditError('That send time is not valid.')
      return
    }
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/scheduled/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: editText,
          ...(when ? { scheduledFor: when.toISOString() } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save changes.')

      // Reflect the edit in the open modal immediately, then reload the lists.
      if (selectedClient) {
        const updatedMessages = selectedClient.messages.map((msg) =>
          msg.id.toString() === messageId
            ? { ...msg, message: editText, ...(when ? { scheduledFor: when.toISOString() } : {}) }
            : msg
        )
        setSelectedClient({ ...selectedClient, messages: updatedMessages })
      }
      setEditingId(null)
      await loadScheduledMessages()
    } catch (e: any) {
      setEditError(e?.message || 'Could not save changes.')
    } finally {
      setSavingEdit(false)
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
      case 'scheduled': return <ClockIcon className="h-4 w-4 text-muted" />
      case 'sent': return <CheckCircleIcon className="h-4 w-4 text-[#16a34a]" />
      case 'failed': return <XMarkIcon className="h-4 w-4 text-accent" />
      case 'cancelled': return <XMarkIcon className="h-4 w-4 text-muted" />
      default: return <ClockIcon className="h-4 w-4 text-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-muted border-hairline'
      case 'sent': return 'text-[#16a34a] border-[#cfe8d4]'
      case 'failed': return 'text-accent border-[#f1c9bd]'
      case 'cancelled': return 'text-muted border-hairline'
      default: return 'text-muted border-hairline'
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
      <div className="flex items-center justify-center py-24">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-hairline p-10 bg-white">
            <div className="text-center mb-8">
              <p className="eyebrow mb-3">Restricted</p>
              <h2 className="font-display text-3xl font-semibold text-ink mb-2">Authentication required</h2>
              <p className="text-muted">Please log in to access your dashboard.</p>
            </div>

            <div className="space-y-3">
              <a
                href="/login"
                className="block text-center rounded-full bg-ink px-5 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Go to login
              </a>
              <a
                href="/register"
                className="block text-center rounded-full border border-hairline px-5 py-2.5 text-ink font-medium hover:bg-[#FAFAF8] transition-colors"
              >
                Create account
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
      <div className="animate-pulse space-y-10 py-4">
        <div>
          <div className="h-3 w-24 bg-[#F1EFE9] rounded mb-4"></div>
          <div className="h-10 w-1/3 bg-[#F1EFE9] rounded mb-3"></div>
          <div className="h-4 w-1/2 bg-[#F1EFE9] rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6">
              <div className="h-3 w-20 bg-[#F1EFE9] rounded mb-3"></div>
              <div className="h-8 w-16 bg-[#F1EFE9] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Stacked status bar for the performance card (sent / scheduled / failed).
  const barTotal = Math.max(sentCount + scheduledCount + failedCount, 1)
  const pct = (n: number) => `${(n / barTotal) * 100}%`

  return (
    <>
            {/* Page header */}
            <header className="flex flex-col gap-5 border-b border-hairline pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow mb-3">Dashboard</p>
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Session reminders
                </h1>
                <p className="mt-2 text-muted">
                  Track your reminders and client communications in one place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}…`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none"
                  />
                </div>
                <a
                  href="/new"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">New reminder</span>
                  <span className="sm:hidden">New</span>
                </a>
              </div>
            </header>

            {/* Setup status: UseSession connection + texting-number verification */}
            <div className="mt-8">
              <DashboardSetupStatus />
            </div>

            <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
              {/* ── Left: reminders table ── */}
              <section className="min-w-0">
                {/* Tabs */}
                <div className="mb-5 inline-flex rounded-full border border-hairline p-1">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'active' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                    }`}
                  >
                    Active ({activeClientsCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('archived')}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'archived' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                    }`}
                  >
                    Archived ({archivedClientsCount})
                  </button>
                </div>

                {filteredClients.length === 0 ? (
                  <div className="rounded-2xl border border-hairline p-16 text-center">
                    <div className="mx-auto mb-6 flex items-center justify-center text-muted">
                      {searchTerm ? <MagnifyingGlassIcon className="h-8 w-8" /> : <ClockIcon className="h-8 w-8" />}
                    </div>
                    <h3 className="font-display mb-3 text-2xl font-semibold text-ink">
                      {searchTerm
                        ? 'No matching clients found'
                        : activeTab === 'active'
                          ? 'No active reminders'
                          : 'No archived sessions yet'}
                    </h3>
                    <p className="mx-auto mb-8 max-w-md leading-relaxed text-muted">
                      {searchTerm
                        ? 'Try adjusting your search terms or check the spelling.'
                        : activeTab === 'active'
                          ? 'Start sending personalized SMS reminders to your photography clients and keep track of them here.'
                          : 'Sessions will automatically appear here after their scheduled date has passed.'}
                    </p>
                    {!searchTerm && (
                      <a
                        href="/new"
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Create your first reminder
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-hairline">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b border-hairline bg-[#FAFAF8] font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                          <tr>
                            <th className="px-5 py-3 font-medium">Client</th>
                            <th className="px-5 py-3 font-medium">Session</th>
                            <th className="px-5 py-3 font-medium">Date</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline">
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
                  <tr
                    key={`${client.clientName}-${client.phone}`}
                    onClick={() => openClientModal(client)}
                    className={`group cursor-pointer transition-colors hover:bg-[#FAFAF8] ${
                      sessionPassed ? 'opacity-70 hover:opacity-100' : ''
                    }`}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-ink">{client.clientName}</div>
                      <div className="font-mono text-xs text-muted">{client.phone}</div>
                    </td>
                    <td className="px-5 py-4 align-top text-muted">
                      {client.sessionTitle || 'Photography Session'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top text-muted">
                      {formatDate(client.sessionTime)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {sessionPassed && (
                          <span className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                            Archived
                          </span>
                        )}
                        {sentMessages.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe8d4] px-2.5 py-0.5 text-xs font-medium text-[#16a34a]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                            {sentMessages.length} sent
                          </span>
                        )}
                        {scheduledMessages.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-muted">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                            {scheduledMessages.length} scheduled
                          </span>
                        )}
                        {failedMessages.length > 0 && (
                          <span className="inline-flex items-center rounded-full border border-[#f1c9bd] px-2.5 py-0.5 text-xs font-medium text-accent">
                            {failedMessages.length} failed
                          </span>
                        )}
                        {cancelledMessages.length > 0 && (
                          <span className="inline-flex items-center rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-muted">
                            {cancelledMessages.length} cancelled
                          </span>
                        )}
                        {client.messages.length === 0 && <span className="text-xs text-muted">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <ChevronRightIcon className="ml-auto h-4 w-4 text-muted transition-colors group-hover:text-accent" />
                    </td>
                  </tr>
                )
              })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              {/* ── Right: stats rail ── */}
              <aside className="space-y-6">
                {/* Performance */}
                <div className="rounded-2xl border border-hairline p-6">
                  <p className="eyebrow mb-2">Delivery rate</p>
                  <span className="font-display text-4xl font-semibold text-ink">{deliveryRate}%</span>
                  <p className="mt-1 text-sm text-muted">
                    {sentCount} of {totalMessages} delivered
                  </p>
                  <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[#F1EFE9]">
                    <div style={{ width: pct(sentCount) }} className="bg-[#16a34a]" />
                    <div style={{ width: pct(scheduledCount) }} className="bg-[#C9C4BB]" />
                    <div style={{ width: pct(failedCount) }} className="bg-accent" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#16a34a]" />Sent</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C9C4BB]" />Scheduled</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Failed</span>
                  </div>
                </div>

                {/* At a glance */}
                <div className="overflow-hidden rounded-2xl border border-hairline">
                  <div className="border-b border-hairline px-6 py-3">
                    <p className="eyebrow">At a glance</p>
                  </div>
                  <dl className="divide-y divide-hairline">
                    {[
                      ['Messages sent', String(sentCount)],
                      ['Scheduled', String(scheduledCount)],
                      ['Failed', String(failedCount)],
                      ['SMS cost', `$${estimatedCost}`],
                      ['Clients', String(uniqueClients)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-6 py-3">
                        <dt className="text-sm text-muted">{k}</dt>
                        <dd className="font-display text-lg font-semibold text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            </div>

        {/* Client Detail Modal */}
        {showClientModal && selectedClient && (
          <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-hairline max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
              <div className="p-6 sm:p-8 border-b border-hairline">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="eyebrow mb-2">Client</p>
                    <h3 className="font-display text-2xl font-semibold text-ink">{selectedClient.clientName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted text-sm mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <PhoneIcon className="h-4 w-4" />
                        <span className="font-mono">{selectedClient.phone}</span>
                      </span>
                      {selectedClient.messages[0]?.email && (
                        <>
                          <span className="text-hairline">•</span>
                          <span>{selectedClient.messages[0].email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClientModal(false)}
                    className="w-9 h-9 rounded-full border border-hairline hover:bg-[#FAFAF8] flex items-center justify-center transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 text-ink" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline rounded-xl overflow-hidden border border-hairline mt-6">
                  <div className="bg-white p-4">
                    <p className="eyebrow mb-1.5">Session Type</p>
                    <p className="text-ink font-medium">{selectedClient.sessionTitle || 'Photography Session'}</p>
                  </div>
                  <div className="bg-white p-4">
                    <p className="eyebrow mb-1.5">Session Date</p>
                    <p className="text-ink font-medium">{formatDate(selectedClient.sessionTime)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
                <p className="eyebrow mb-5">Message Timeline</p>

                <div className="space-y-4">
                  {selectedClient.messages
                    .sort((a, b) => new Date(a.createdAt || a.scheduledFor || (a as SentMessage).timestamp || 0).getTime() - new Date(b.createdAt || b.scheduledFor || (b as SentMessage).timestamp || 0).getTime())
                    .map((message) => (
                    <div key={message.id} className="rounded-xl border border-hairline p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5">{getStatusIcon(message.status)}</span>
                          <div>
                            <h5 className="font-display font-semibold text-ink">
                              {'reminderType' in message && message.reminderType === 'registration' && 'Registration Confirmation'}
                              {'reminderType' in message && message.reminderType === 'manual' && 'Manual Message'}
                              {'reminderType' in message && message.reminderType === '3-day' && '3-Day Reminder'}
                              {'reminderType' in message && message.reminderType === '1-day' && '1-Day Reminder'}
                              {!('reminderType' in message) && 'Scheduled Reminder'}
                            </h5>
                            <div className="text-sm text-muted mt-1">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                                {'reminderType' in message && (message.reminderType === 'registration' || message.reminderType === 'manual') ? (
                                  <span>Sent: {formatDate(message.scheduledFor || '')}</span>
                                ) : (
                                  <>
                                    <span>Scheduled: {formatDate(message.scheduledFor || '')}</span>
                                    {message.sentAt && (
                                      <span>Sent: {formatDate(message.sentAt)}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                          {message.status === 'scheduled' && editingId !== message.id.toString() && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(message)
                              }}
                              className="px-3 py-1 text-xs font-medium rounded-full border border-hairline text-ink transition-colors hover:bg-[#FAFAF8]"
                            >
                              Edit
                            </button>
                          )}
                          {message.status === 'scheduled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelMessage(message.id.toString())
                              }}
                              disabled={cancellingMessages.has(message.id.toString())}
                              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                cancelledMessages.has(message.id.toString())
                                  ? 'border-[#cfe8d4] text-[#16a34a]'
                                  : cancellingMessages.has(message.id.toString())
                                  ? 'border-hairline text-muted cursor-not-allowed'
                                  : 'border-[#f1c9bd] text-accent hover:bg-[#FAFAF8]'
                              }`}
                            >
                              {cancelledMessages.has(message.id.toString())
                                ? 'Cancelled'
                                : cancellingMessages.has(message.id.toString())
                                ? 'Cancelling...'
                                : 'Cancel'}
                            </button>
                          )}
                          {message.status === 'cancelled' && (
                            <span className="px-3 py-1 border border-hairline text-muted text-xs font-medium rounded-full">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      {editingId === message.id.toString() ? (
                        <div className="rounded-lg border border-hairline p-4">
                          <label className="eyebrow mb-2 block">Message</label>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={4}
                            className="w-full resize-y rounded-lg border border-hairline bg-white p-3 text-sm text-ink focus:border-ink focus:outline-none"
                          />
                          <div className="mt-1 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                            {editText.length} chars
                          </div>

                          <label className="eyebrow mb-2 mt-3 block">Send time</label>
                          <input
                            type="datetime-local"
                            value={editWhen}
                            onChange={(e) => setEditWhen(e.target.value)}
                            className="w-full rounded-lg border border-hairline bg-white p-2.5 text-sm text-ink focus:border-ink focus:outline-none"
                          />
                          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                            Nothing sends before 8 AM ET regardless of the exact time.
                          </p>

                          {editError && (
                            <p className="mt-3 text-sm text-accent">{editError}</p>
                          )}

                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEdit(message.id.toString())
                              }}
                              disabled={savingEdit}
                              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                              {savingEdit ? 'Saving…' : 'Save changes'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEdit()
                              }}
                              disabled={savingEdit}
                              className="rounded-full border border-hairline px-4 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-[#FAFAF8] disabled:opacity-50"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-[#FAFAF8] border border-hairline p-4">
                          <p className="eyebrow mb-2">Message Content</p>
                          <p className="text-ink leading-relaxed text-sm">
                            “{message.message || 'No message content stored'}”
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3 font-mono text-xs text-muted">
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
    </>
  )
}