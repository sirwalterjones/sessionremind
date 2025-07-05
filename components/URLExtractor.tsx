'use client'

import React, { useState } from 'react'

interface URLExtractorProps {
  onDataExtracted: (data: any) => void
}

export default function URLExtractor({ onDataExtracted }: URLExtractorProps) {
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [showExample, setShowExample] = useState(false)
  
  const extractFromURL = async () => {
    if (!url.trim()) {
      alert('Please enter a UseSession URL')
      return
    }
    
    setIsExtracting(true)
    
    try {
      // Call the existing server-side extraction API
      const response = await fetch('/api/extract-usesession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          method: 'url_extraction'
        }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // Extract the data and pass it to the parent
        const extractedData = {
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          sessionTitle: result.data.sessionTitle || '',
          sessionTime: result.data.sessionTime || '',
        }
        
        onDataExtracted(extractedData)
        
        alert(`✅ Data extracted successfully!\n\nFound:\n• Name: ${extractedData.name || 'Not found'}\n• Email: ${extractedData.email || 'Not found'}\n• Phone: ${extractedData.phone || 'Not found'}\n• Session: ${extractedData.sessionTitle || 'Not found'}`)
        
        setUrl('') // Clear the URL field
      } else {
        throw new Error(result.error || 'Failed to extract data')
      }
    } catch (error) {
      console.error('URL extraction error:', error)
      alert(`❌ Could not extract data from URL.\n\nTry:\n• Check the URL is correct\n• Make sure it's a UseSession client page\n• Or use manual entry instead`)
    } finally {
      setIsExtracting(false)
    }
  }
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.includes('usesession.com') || text.includes('app.usesession.com')) {
        setUrl(text)
      } else {
        alert('Clipboard does not contain a UseSession URL')
      }
    } catch (err) {
      alert('Could not access clipboard. Please manually paste the URL.')
    }
  }
  
  return (
    <div className="bg-white border border-blue-200 rounded-xl p-4">
      <div className="flex items-start space-x-3">
        <span className="text-blue-600 text-2xl">🔗</span>
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 mb-2">Extract from UseSession URL</h4>
          <p className="text-blue-800 text-sm mb-4">
            Paste the UseSession page URL and we'll extract the client data automatically
          </p>
          
          {/* URL Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UseSession Page URL:
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://app.usesession.com/sessions/..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handlePaste}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  📋 Paste
                </button>
              </div>
            </div>
            
            {/* Example URL */}
            <div className="bg-blue-50 rounded-lg p-3">
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-blue-700 text-sm font-medium hover:text-blue-800"
              >
                {showExample ? '👆 Hide' : '👀 Show'} example URL format
              </button>
              
              {showExample && (
                <div className="mt-2 text-blue-700 text-xs">
                  <p className="font-medium mb-1">Example UseSession URLs:</p>
                  <ul className="space-y-1 ml-2">
                    <li>• https://app.usesession.com/sessions/abc123</li>
                    <li>• https://app.usesession.com/bookings/xyz789</li>
                    <li>• Any UseSession page with client details</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={extractFromURL}
                disabled={!url.trim() || isExtracting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExtracting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting...
                  </span>
                ) : (
                  '🚀 Extract Data'
                )}
              </button>
              
              <button
                onClick={() => setUrl('')}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-900 mb-2">📱 How to get the URL:</h5>
            <ol className="text-green-800 text-sm space-y-1">
              <li>1. Open UseSession in your mobile browser</li>
              <li>2. Navigate to the client's session page</li>
              <li>3. Tap the address bar and copy the URL</li>
              <li>4. Come back here and paste it above</li>
              <li>5. Tap "Extract Data" and the form fills automatically!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}