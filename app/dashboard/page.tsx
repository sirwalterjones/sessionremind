'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ClockIcon, PlayIcon, CogIcon, PlusIcon } from '@heroicons/react/24/outline'

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

export default function Dashboard() {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [cronRunning, setCronRunning] = useState(false)
  const [cronResult, setCronResult] = useState<string>('')
  const [showCronResult, setShowCronResult] = useState(false)
  const [scheduledCount, setScheduledCount] = useState(0)

  useEffect(() => {
    // Load sent messages from localStorage
    const stored = localStorage.getItem('sentMessages')
    if (stored) {
      setSentMessages(JSON.parse(stored))
    }
    loadScheduledMessages()
    setLoading(false)
  }, [])

  const loadScheduledMessages = async () => {
    try {
      const response = await fetch('/api/schedule-reminders')
      if (response.ok) {
        const data = await response.json()
        setScheduledCount(data.scheduledMessages?.filter((msg: any) => msg.status === 'scheduled').length || 0)
      }
    } catch (error) {
      console.error('Failed to load scheduled messages:', error)
    }
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
        // Reload scheduled count
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const clearAllMessages = () => {
    if (confirm('Are you sure you want to clear all sent messages?')) {
      localStorage.removeItem('sentMessages')
      setSentMessages([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-rose-200 rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-rose-200 rounded-xl w-1/3 mx-auto mb-2"></div>
              <div className="h-4 bg-rose-200 rounded-lg w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-rose-200 rounded-lg mb-2"></div>
                  <div className="h-8 bg-rose-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-6">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            SMS Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Track your session reminders and client communications with ease
          </p>
          
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
              className="inline-flex items-center px-6 py-3 bg-rose-400 text-white font-medium rounded-full hover:bg-rose-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Reminder
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-blue-600 text-xl">📱</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">{sentMessages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sentMessages.length > 0 ? '100%' : '0%'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-amber-600 text-xl">⏰</span>
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
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-6">
                <CogIcon className="h-6 w-6 text-purple-600" />
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
                  : 'bg-rose-400 text-white hover:bg-rose-500 hover:shadow-md transform hover:-translate-y-0.5'
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
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <p className="text-sm font-medium text-blue-800 mb-2">📋 Workflow</p>
              <p className="text-blue-700 text-sm leading-relaxed">Enrollment → First Message → Scheduled Reminders</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <p className="text-sm font-medium text-green-800 mb-2">⏰ Schedule</p>
              <p className="text-green-700 text-sm leading-relaxed">3-day and 1-day reminders at 10:00 AM</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
              <p className="text-sm font-medium text-purple-800 mb-2">🔄 Status</p>
              <p className="text-purple-700 text-sm leading-relaxed">{scheduledCount} pending reminders</p>
            </div>
          </div>
          
          {showCronResult && (
            <div className={`p-6 rounded-xl border ${
              cronResult.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{cronResult}</p>
            </div>
          )}
        </div>

        {/* Messages List */}
        <div>
          {sentMessages.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <ClockIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No reminders sent yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Start sending personalized SMS reminders to your photography clients and keep track of them here.
              </p>
              <a
                href="/new"
                className="inline-flex items-center px-8 py-4 bg-rose-400 text-white font-medium rounded-full hover:bg-rose-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span className="mr-3 text-xl">🚀</span>
                <span className="text-lg">Create Your First Reminder</span>
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-600 text-sm font-bold">{sentMessages.length}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Reminders</h2>
              </div>
              
              {sentMessages.map((message) => (
                <div key={message.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-6">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{message.name}</h4>
                        <p className="text-gray-600">{message.phone}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-full">
                      ✅ {message.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                      <p className="text-sm font-medium text-purple-800 mb-2">📸 Session Type</p>
                      <p className="text-purple-700 font-medium">{message.sessionTitle}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                      <p className="text-sm font-medium text-blue-800 mb-2">📅 Session Date</p>
                      <p className="text-blue-700 font-medium">{message.sessionTime}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-6">
                    <p className="text-sm font-medium text-gray-800 mb-3">💬 Message Sent</p>
                    <p className="text-gray-700 leading-relaxed italic">"{message.message}"</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center">
                        <span className="mr-2">🕒</span>
                        Sent: {formatDate(message.timestamp)}
                      </span>
                      {message.email && (
                        <span className="flex items-center">
                          <span className="mr-2">✉️</span>
                          {message.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}