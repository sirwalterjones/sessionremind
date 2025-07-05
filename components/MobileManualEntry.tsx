'use client'

import React, { useState, useEffect } from 'react'

interface MobileManualEntryProps {
  onDataExtracted?: (data: any) => void
}

export default function MobileManualEntry({ onDataExtracted }: MobileManualEntryProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    sessionTitle: '',
    sessionTime: ''
  })
  
  useEffect(() => {
    const mobile = window.innerWidth <= 768 || /android|iphone|ipad|ipod|blackberry|windows phone/i.test(navigator.userAgent)
    setIsMobile(mobile)
  }, [])
  
  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    // Auto-update the parent form as user types
    if (onDataExtracted) {
      onDataExtracted(newData)
    }
  }
  
  const quickFillSession = (sessionType: string) => {
    const newData = { ...formData, sessionTitle: sessionType }
    setFormData(newData)
    if (onDataExtracted) {
      onDataExtracted(newData)
    }
  }
  
  const clearForm = () => {
    const emptyData = {
      name: '',
      phone: '',
      email: '',
      sessionTitle: '',
      sessionTime: ''
    }
    setFormData(emptyData)
    if (onDataExtracted) {
      onDataExtracted(emptyData)
    }
  }
  
  if (!isMobile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-gray-600 text-sm">
          🖥️ Desktop users: Use the browser extension for automatic data extraction
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <h3 className="font-bold text-blue-900 text-lg mb-2">📱 Mobile: Quick Entry</h3>
        <p className="text-blue-800 text-sm">
          Look at the UseSession modal and enter the client details below
        </p>
      </div>
      
      {/* Quick Entry Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="font-bold text-gray-900 mb-4">Client Details:</h4>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Sarah Johnson"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number:
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="e.g., (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="e.g., sarah@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Session Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type:
            </label>
            <input
              type="text"
              value={formData.sessionTitle}
              onChange={(e) => handleInputChange('sessionTitle', e.target.value)}
              placeholder="e.g., Summer Field Session"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Quick Fill Buttons */}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => quickFillSession('Summer Field Session')}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs hover:bg-green-200"
              >
                Summer Field
              </button>
              <button
                onClick={() => quickFillSession('Christmas Mini Session')}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs hover:bg-red-200"
              >
                Christmas Mini
              </button>
              <button
                onClick={() => quickFillSession('Beach Portrait Session')}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
              >
                Beach Portrait
              </button>
              <button
                onClick={() => quickFillSession('Family Session')}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs hover:bg-purple-200"
              >
                Family
              </button>
            </div>
          </div>
          
          {/* Session Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date & Time:
            </label>
            <input
              type="text"
              value={formData.sessionTime}
              onChange={(e) => handleInputChange('sessionTime', e.target.value)}
              placeholder="e.g., Saturday, July 15th at 6:00 PM"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Clear Button */}
          <button
            onClick={clearForm}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            🗑️ Clear All Fields
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h4 className="font-bold text-green-900 mb-2">📱 How to Use:</h4>
        <ol className="text-green-800 text-sm space-y-1">
          <li>1. Open UseSession on your phone</li>
          <li>2. Find your client and tap to open their details modal</li>
          <li>3. Look at the modal and type the info above</li>
          <li>4. Scroll down to send the reminder</li>
        </ol>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-xs font-medium">
            💡 Pro Tip: As you type, the form below automatically fills! No need to click "extract" or anything.
          </p>
        </div>
      </div>
    </div>
  )
}