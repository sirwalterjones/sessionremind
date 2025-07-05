'use client'

import React, { useState, useEffect } from 'react'

interface SimpleMobileProps {
  onDataExtracted?: (data: any) => void
}

export default function SimpleMobile({ onDataExtracted }: SimpleMobileProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  
  useEffect(() => {
    const mobile = window.innerWidth <= 768 || /android|iphone|ipad|ipod|blackberry|windows phone/i.test(navigator.userAgent)
    setIsMobile(mobile)
  }, [])
  
  const handleExtract = async () => {
    if (!url.trim()) {
      alert('Please paste the UseSession URL first')
      return
    }
    
    if (!url.includes('usesession.com')) {
      alert('Please use a UseSession URL (app.usesession.com)')
      return
    }
    
    setIsExtracting(true)
    
    try {
      const response = await fetch('/api/extract-usesession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        const data = result.data
        if (onDataExtracted) {
          onDataExtracted(data)
        }
        
        alert(`✅ Success!\n\nFound:\n• ${data.name || 'No name'}\n• ${data.email || 'No email'}\n• ${data.phone || 'No phone'}\n• ${data.sessionTitle || 'No session title'}`)
        setUrl('')
      } else {
        throw new Error(result.error || 'Failed to extract data')
      }
    } catch (error) {
      console.error('Extraction error:', error)
      alert('❌ Could not extract data. Make sure the URL is from a UseSession client page.')
    } finally {
      setIsExtracting(false)
    }
  }
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.includes('usesession.com')) {
        setUrl(text)
      } else {
        alert('Clipboard does not contain a UseSession URL')
      }
    } catch (err) {
      alert('Please manually paste the URL in the box below')
    }
  }
  
  if (!isMobile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-gray-600 text-sm">
          🖥️ Desktop users: Use the browser extension or bookmarklet for best experience
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <h3 className="font-bold text-blue-900 text-lg mb-2">📱 Mobile: Copy URL Method</h3>
        <p className="text-blue-800 text-sm">
          Copy the UseSession page URL and paste it below
        </p>
      </div>
      
      {/* URL Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          UseSession Page URL:
        </label>
        
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste UseSession URL here..."
              className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePaste}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              📋
            </button>
          </div>
          
          <button
            onClick={handleExtract}
            disabled={!url.trim() || isExtracting}
            className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtracting ? 'Extracting...' : '🚀 Extract Client Data'}
          </button>
        </div>
      </div>
      
      {/* Simple Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h4 className="font-bold text-green-900 mb-2">How to use:</h4>
        <ol className="text-green-800 text-sm space-y-1">
          <li>1. Open UseSession on your phone</li>
          <li>2. Go to a client's session page</li>
          <li>3. Copy the URL from the address bar</li>
          <li>4. Paste it above and tap "Extract"</li>
        </ol>
      </div>
      
      {/* Alternative */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <h4 className="font-bold text-orange-900 mb-2">Can't extract? Manual entry:</h4>
        <p className="text-orange-800 text-sm mb-3">
          If URL extraction doesn't work, you can manually enter client details in the form below.
        </p>
        <button
          onClick={() => {
            // Scroll to form
            const form = document.querySelector('form')
            if (form) {
              form.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
        >
          📝 Go to Manual Entry Form
        </button>
      </div>
    </div>
  )
}