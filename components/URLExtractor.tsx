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
      alert('Please enter a Session URL')
      return
    }
    
    setIsExtracting(true)
    
    try {
      // Call the existing server-side extraction API
      const response = await fetch('/api/extract-session', {
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
      alert(`❌ Could not extract data from URL.\n\nTry:\n• Check the URL is correct\n• Make sure it's a Session client page\n• Or use manual entry instead`)
    } finally {
      setIsExtracting(false)
    }
  }
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.includes('session.com') || text.includes('app.session.com')) {
        setUrl(text)
      } else {
        alert('Clipboard does not contain a Session URL')
      }
    } catch (err) {
      alert('Could not access clipboard. Please manually paste the URL.')
    }
  }
  
  return (
    <div className="bg-card border border-hairline rounded-xl p-4">
      <div className="flex items-start space-x-3">
        <span className="text-accent text-2xl">🔗</span>
        <div className="flex-1">
          <h4 className="font-bold text-ink mb-2">Extract from Session URL</h4>
          <p className="text-muted text-sm mb-4">
            Paste the Session page URL and we'll extract the client data automatically
          </p>
          
          {/* URL Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Session Page URL:
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://app.session.com/sessions/..."
                  className="flex-1 px-3 py-2 border border-hairline bg-card text-ink placeholder:text-faint rounded-lg focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 text-sm"
                />
                <button
                  onClick={handlePaste}
                  className="px-3 py-2 border border-hairline text-ink rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  📋 Paste
                </button>
              </div>
            </div>
            
            {/* Example URL */}
            <div className="bg-sky-400/10 border border-sky-400/20 rounded-lg p-3">
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-sky-300 text-sm font-medium hover:text-sky-200"
              >
                {showExample ? '👆 Hide' : '👀 Show'} example URL format
              </button>
              
              {showExample && (
                <div className="mt-2 text-sky-300 text-xs">
                  <p className="font-medium mb-1">✅ Session URLs that work:</p>
                  <ul className="space-y-1 ml-2">
                    <li>• <strong>Individual session pages:</strong> app.session.com/sessions/...</li>
                    <li>• <strong>Client booking details:</strong> app.session.com/bookings/...</li>
                    <li>• <strong>Calendar view pages:</strong> with client contact info visible</li>
                    <li>• <strong>Session management pages:</strong> showing client details</li>
                  </ul>
                  <p className="font-medium mt-2 text-sky-200">🎯 Best results from individual session pages!</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={extractFromURL}
                disabled={!url.trim() || isExtracting}
                className="flex-1 px-4 py-3 bg-accent text-accent-ink rounded-lg font-semibold hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
              >
                {isExtracting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-accent-ink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="px-4 py-3 border border-hairline text-ink rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3">
            <h5 className="font-medium text-emerald-200 mb-2">📱 Step-by-Step Mobile Instructions:</h5>
            <ol className="text-emerald-300 text-sm space-y-2">
              <li><strong>1. Open Session:</strong> Go to app.session.com in your mobile browser</li>
              <li><strong>2. Find your client:</strong> Navigate to the specific session page (app.session.com/sessions/...)</li>
              <li><strong>3. Copy URL:</strong> Tap the address bar, select all, and copy the full URL</li>
              <li><strong>4. Return here:</strong> Come back to Session Reminder and paste the URL above</li>
              <li><strong>5. Extract:</strong> Tap "Extract Data" - name, email, phone, and session details fill automatically!</li>
            </ol>
            
            <div className="mt-3 p-2 bg-amber-300/10 border border-amber-300/20 rounded">
              <p className="text-amber-200 text-xs font-medium">💡 Pro Tip: Individual session pages (with URLs like app.session.com/sessions/abc123) give the best extraction results!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}