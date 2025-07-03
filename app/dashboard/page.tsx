'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

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

  useEffect(() => {
    // Load sent messages from localStorage
    const stored = localStorage.getItem('sentMessages')
    if (stored) {
      setSentMessages(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

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
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse space-y-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-slate-200 rounded-3xl mx-auto mb-4"></div>
            <div className="h-8 bg-slate-200 rounded-xl w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/60 rounded-3xl p-6">
                <div className="h-6 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-8 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/60 rounded-3xl p-6">
                <div className="h-24 bg-slate-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mb-6">
          <span className="text-3xl">📊</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          SMS Dashboard
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          Track your session reminders and client communications
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={clearAllMessages}
            className="group inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🗑️</span>
            Clear All
          </button>
          <a
            href="/new"
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="mr-2">✨</span>
            New Reminder
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">📱</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Sent</p>
              <p className="text-3xl font-bold text-slate-800">{sentMessages.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">✅</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Success Rate</p>
              <p className="text-3xl font-bold text-slate-800">
                {sentMessages.length > 0 ? '100%' : '0%'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">This Month</p>
              <p className="text-3xl font-bold text-slate-800">
                {sentMessages.filter(m => 
                  new Date(m.timestamp).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div>
        {sentMessages.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-12 shadow-xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No reminders sent yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Start sending personalized SMS reminders to your photography clients and keep track of them here.
            </p>
            <a
              href="/new"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="mr-3 text-xl">🚀</span>
              <span className="text-lg">Create Your First Reminder</span>
              <span className="ml-3 group-hover:translate-x-1 transition-transform text-lg">→</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">{sentMessages.length}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Recent Reminders</h3>
            </div>
            
            {sentMessages.map((message) => (
              <div key={message.id} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{message.name}</h4>
                      <p className="text-slate-600">{message.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl">
                      ✅ {message.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-purple-800 mb-1">📸 Session Type</p>
                    <p className="text-purple-700">{message.sessionTitle}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-1">📅 Session Date</p>
                    <p className="text-blue-700">{message.sessionTime}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-4 mb-4">
                  <p className="text-sm font-semibold text-slate-800 mb-2">💬 Message Sent</p>
                  <p className="text-slate-700 italic">"{message.message}"</p>
                </div>
                
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <div className="flex items-center">
                    <span className="mr-4">🕒 Sent: {formatDate(message.timestamp)}</span>
                    {message.email && (
                      <span>✉️ {message.email}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}