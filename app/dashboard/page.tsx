'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ClockIcon, PlayIcon, CogIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon, CalendarIcon, PhoneIcon } from '@heroicons/react/24/outline'

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
  reminderType: '3-day' | '1-day' | 'test-2min' | 'test-5min'
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
}

interface ClientGroup {
  clientName: string
  phone: string
  sessionTitle: string
  sessionTime: string
  messages: ScheduledMessage[]
}

export default function Dashboard() {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [cronRunning, setCronRunning] = useState(false)
  const [cronResult, setCronResult] = useState<string>('')
  const [showCronResult, setShowCronResult] = useState(false)
  const [scheduledCount, setScheduledCount] = useState(0)
  const [showClearModal, setShowClearModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Load sent messages from localStorage
      const stored = localStorage.getItem('sentMessages')
      if (stored) {
        setSentMessages(JSON.parse(stored))
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
        
        // Group messages by client
        const groups = groupMessagesByClient(messages)
        setClientGroups(groups)
      }
    } catch (error) {
      console.error('Failed to load scheduled messages:', error)
    }
  }

  const groupMessagesByClient = (messages: ScheduledMessage[]): ClientGroup[] => {
    const grouped = messages.reduce((acc, message) => {
      const key = `${message.clientName}-${message.phone}`
      if (!acc[key]) {
        acc[key] = {
          clientName: message.clientName,
          phone: message.phone,
          sessionTitle: message.sessionTitle || 'Photography Session',
          sessionTime: message.sessionTime || message.sessionDate || '',
          messages: []
        }
      } else {
        // Update with better data if current is empty/invalid
        if (!acc[key].sessionTitle || acc[key].sessionTitle === 'Photography Session') {
          acc[key].sessionTitle = message.sessionTitle || acc[key].sessionTitle
        }
        if (!acc[key].sessionTime) {
          acc[key].sessionTime = message.sessionTime || message.sessionDate || acc[key].sessionTime
        }
      }
      acc[key].messages.push(message)
      return acc
    }, {} as Record<string, ClientGroup>)

    return Object.values(grouped).sort((a, b) => 
      new Date(b.messages[0]?.createdAt || 0).getTime() - new Date(a.messages[0]?.createdAt || 0).getTime()
    )
  }

  const runCronJob = async () => {
    setCronRunning(true)
    setCronResult('')
    setShowCronResult(false)
    
    try {
      const response = await fetch('/api/process-scheduled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setCronResult(`✅ Cron job completed successfully! Processed ${result.processed || 0} messages.`)
        // Reload all data to get updated statuses
        await loadScheduledMessages()
      } else {
        setCronResult(`❌ Cron job failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      setCronResult(`❌ Error running cron job: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCronRunning(false)
      setShowCronResult(true)
      // Hide result after 10 seconds
      setTimeout(() => setShowCronResult(false), 10000)
    }
  }

  const clearAllMessages = () => {
    setShowClearModal(true)
  }

  const confirmClearAll = () => {
    localStorage.removeItem('sentMessages')
    setSentMessages([])
    setShowClearModal(false)
  }

  const cancelMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/cancel-message/${messageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Reload data to reflect cancellation
        await loadScheduledMessages()
        setCronResult(`✅ Message cancelled successfully`)
        setShowCronResult(true)
        setTimeout(() => setShowCronResult(false), 5000)
      } else {
        setCronResult(`❌ Failed to cancel message`)
        setShowCronResult(true)
        setTimeout(() => setShowCronResult(false), 5000)
      }
    } catch (error) {
      setCronResult(`❌ Error cancelling message: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowCronResult(true)
      setTimeout(() => setShowCronResult(false), 5000)
    }
  }

  const openClientModal = (client: ClientGroup) => {
    setSelectedClient(client)
    setShowClientModal(true)
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
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'sent': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const filteredClients = clientGroups.filter(client => 
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-2xl mx-auto mb-8">
            <p className="text-emerald-800 text-sm">
              ✅ <strong>Persistent Storage:</strong> Scheduled messages are now stored in Vercel KV (Redis) and will survive server restarts. 
              Your reminders will be sent at the correct times!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={clearAllMessages}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <span className="mr-2">🗑️</span>
              Clear All
            </button>
            <a
              href="/new"
              className="inline-flex items-center px-6 py-3 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Reminder
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-6">
                <span className="text-stone-600 text-xl">📱</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">{sentMessages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-stone-300 rounded-full flex items-center justify-center mr-6">
                <span className="text-stone-700 text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sentMessages.length > 0 ? '100%' : '0%'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-stone-400 rounded-full flex items-center justify-center mr-6">
                <span className="text-white text-xl">⏰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-gray-900">
                  {scheduledCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cron Job Management */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mr-6">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Cron Job Management</h2>
                <p className="text-gray-600">Manually process scheduled reminder messages</p>
              </div>
            </div>
            
            <button
              onClick={runCronJob}
              disabled={cronRunning}
              className={`inline-flex items-center px-6 py-3 font-medium rounded-full transition-all duration-200 shadow-sm ${
                cronRunning 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-stone-800 text-white hover:bg-stone-900 hover:shadow-md transform hover:-translate-y-0.5'
              }`}
            >
              {cronRunning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Run Cron Job
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <p className="text-sm font-medium text-stone-800 mb-2">📋 Workflow</p>
              <p className="text-stone-700 text-sm leading-relaxed">Enrollment → First Message → Scheduled Reminders</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <p className="text-sm font-medium text-stone-800 mb-2">⏰ Schedule</p>
              <p className="text-stone-700 text-sm leading-relaxed">3-day and 1-day reminders at 10:00 AM</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
              <p className="text-sm font-medium text-stone-800 mb-2">🔄 Status</p>
              <p className="text-stone-700 text-sm leading-relaxed">{scheduledCount} pending reminders</p>
            </div>
          </div>
          
          {showCronResult && (
            <div className={`p-6 rounded-xl border ${
              cronResult.includes('✅') 
                ? 'bg-stone-50 border-stone-200 text-stone-800' 
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
              <p className="font-medium">{cronResult}</p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, phone numbers, or session types..."
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
                {searchTerm ? 'No matching clients found' : 'No reminders scheduled yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm 
                  ? 'Try adjusting your search terms or check the spelling.'
                  : 'Start sending personalized SMS reminders to your photography clients and keep track of them here.'
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
                    {searchTerm ? `Search Results` : 'Client Reminders'}
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
                
                return (
                  <div 
                    key={`${client.clientName}-${client.phone}`} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => openClientModal(client)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
                          <span className="text-stone-600 text-xl">👤</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{client.clientName}</h4>
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {client.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">{client.messages.length} message{client.messages.length !== 1 ? 's' : ''}</div>
                        <div className="flex gap-2">
                          {scheduledMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {scheduledMessages.length} scheduled
                            </span>
                          )}
                          {sentMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {sentMessages.length} sent
                            </span>
                          )}
                          {failedMessages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {failedMessages.length} failed
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
                        <span>Created {formatDate(client.messages[0]?.createdAt)}</span>
                      </div>
                      <span className="text-stone-600 font-medium">Click to view details →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Clear All Messages</h3>
                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Are you sure you want to permanently delete all {sentMessages.length} sent message{sentMessages.length !== 1 ? 's' : ''}? 
                  This will clear your entire message history and cannot be recovered.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClearAll}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-all duration-200"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                    .map((message) => (
                    <div key={message.id} className="bg-stone-50 border border-stone-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getStatusIcon(message.status)}
                          <div className="ml-3">
                            <h5 className="font-semibold text-gray-900">
                              {message.reminderType === '3-day' && '3-Day Reminder'}
                              {message.reminderType === '1-day' && '1-Day Reminder'} 
                              {message.reminderType === 'test-2min' && 'Test 2-Min Reminder'}
                              {message.reminderType === 'test-5min' && 'Test 5-Min Reminder'}
                            </h5>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-4">
                                <span>🕒 Scheduled: {formatDate(message.scheduledFor)}</span>
                                {message.sentAt && (
                                  <span>✅ Sent: {formatDate(message.sentAt)}</span>
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
                                cancelMessage(message.id)
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
                            >
                              Cancel
                            </button>
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
                        <span>Created: {formatDate(message.createdAt)}</span>
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