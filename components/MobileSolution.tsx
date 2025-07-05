'use client'

import React, { useState, useEffect } from 'react'

export default function MobileSolution() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showQR, setShowQR] = useState(false)
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const mobile = window.innerWidth <= 768 || /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
    const ios = /ipad|iphone|ipod/.test(userAgent)
    const android = /android/.test(userAgent)
    
    setIsMobile(mobile)
    setIsIOS(ios)
    setIsAndroid(android)
  }, [])
  
  const handleURLShare = () => {
    const instructions = `
🎯 MOBILE WORKFLOW THAT ACTUALLY WORKS:

📱 Step 1: Open UseSession
• Go to your client's session page in UseSession
• Look for the session with client details

📋 Step 2: Copy the URL
• Tap the address bar
• Copy the entire UseSession URL
• It should look like: app.usesession.com/sessions/...

🔗 Step 3: Share the URL
• Tap this link: https://sessionremind.com/new
• Paste the UseSession URL in the "Extract from URL" field
• Tap "Extract Data" button
• Form fills automatically!

✨ That's it! No bookmarklets needed.
`
    
    alert(instructions)
  }
  
  const openNewTab = () => {
    window.open('/new', '_blank')
  }
  
  if (!isMobile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          🖥️ You're on desktop. Use the browser extension or bookmarklet for the best experience.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-bold text-green-900 mb-2 text-lg">
          📱 Mobile Solution That Actually Works!
        </h3>
        <p className="text-green-800 text-sm">
          Forget bookmarklets - here's what actually works on mobile:
        </p>
      </div>
      
      {/* Method 1: URL Sharing */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-2xl">🎯</span>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-2">Method 1: URL Copy & Paste</h4>
            <p className="text-blue-800 text-sm mb-3">
              Copy the UseSession URL and paste it into our extraction tool
            </p>
            
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <h5 className="font-medium text-blue-900 mb-2">How it works:</h5>
              <ol className="text-blue-800 text-sm space-y-1">
                <li>1. 📱 Open app.usesession.com on your phone</li>
                <li>2. 🎯 Go to the specific client session page</li>
                <li>3. 📋 Copy the full URL (app.usesession.com/sessions/...)</li>
                <li>4. 🔗 Open Session Reminder (button below)</li>
                <li>5. 📝 Paste URL in the "Extract from URL" field</li>
                <li>6. ✨ Client data fills automatically!</li>
              </ol>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={openNewTab}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                🚀 Open Session Reminder
              </button>
              
              <button
                onClick={handleURLShare}
                className="w-full px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                📖 Show Step-by-Step Guide
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Method 2: PWA Share Target */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-purple-600 text-2xl">📲</span>
          <div className="flex-1">
            <h4 className="font-bold text-purple-900 mb-2">Method 2: Install as App</h4>
            <p className="text-purple-800 text-sm mb-3">
              Install Session Reminder as an app, then share UseSession pages directly to it
            </p>
            
            {isIOS && (
              <div className="bg-purple-50 rounded-lg p-3 mb-3">
                <h5 className="font-medium text-purple-900 mb-2">📱 iOS Installation:</h5>
                <ol className="text-purple-800 text-sm space-y-1">
                  <li>1. Tap Safari Share button</li>
                  <li>2. Scroll down → "Add to Home Screen"</li>
                  <li>3. Name it "Session Reminder"</li>
                  <li>4. On UseSession: Share → Session Reminder</li>
                </ol>
              </div>
            )}
            
            {isAndroid && (
              <div className="bg-purple-50 rounded-lg p-3 mb-3">
                <h5 className="font-medium text-purple-900 mb-2">🤖 Android Installation:</h5>
                <ol className="text-purple-800 text-sm space-y-1">
                  <li>1. Chrome menu → "Install app"</li>
                  <li>2. Or "Add to Home screen"</li>
                  <li>3. On UseSession: Share → Session Reminder</li>
                  <li>4. Data extracts automatically!</li>
                </ol>
              </div>
            )}
            
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  const msg = isIOS 
                    ? '📱 iOS: Tap Share → Add to Home Screen'
                    : isAndroid 
                    ? '🤖 Android: Tap ⋮ → Install app'
                    : '📲 Install as app for best experience'
                  alert(msg)
                } else {
                  alert('PWA not supported on this device')
                }
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              📲 Install App
            </button>
          </div>
        </div>
      </div>
      
      {/* Method 3: Manual Entry */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-orange-600 text-2xl">✏️</span>
          <div className="flex-1">
            <h4 className="font-bold text-orange-900 mb-2">Method 3: Manual Entry</h4>
            <p className="text-orange-800 text-sm mb-3">
              When all else fails, manually copy client details
            </p>
            
            <div className="bg-orange-50 rounded-lg p-3 mb-3">
              <h5 className="font-medium text-orange-900 mb-2">Quick copy process:</h5>
              <ol className="text-orange-800 text-sm space-y-1">
                <li>1. 👀 Look at UseSession client details</li>
                <li>2. 📝 Write down: name, phone, email, session info</li>
                <li>3. 🚀 Open Session Reminder</li>
                <li>4. ⌨️ Type the details into the form</li>
                <li>5. 📤 Send reminder!</li>
              </ol>
            </div>
            
            <button
              onClick={openNewTab}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              📝 Open Manual Form
            </button>
          </div>
        </div>
      </div>
      
      {/* QR Code Solution */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-gray-600 text-2xl">📱</span>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">Quick Access QR Code</h4>
            <p className="text-gray-700 text-sm mb-3">
              Scan this QR code to quickly open Session Reminder
            </p>
            
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              {showQR ? '📱 Hide QR Code' : '📱 Show QR Code'}
            </button>
            
            {showQR && (
              <div className="mt-3 text-center">
                <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                  <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                    QR Code for<br/>sessionremind.com/new
                    <br/><br/>
                    [Generate actual QR code here]
                  </div>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  Scan with camera app to open Session Reminder
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Success Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-bold text-yellow-900 mb-2">💡 Pro Tips for Mobile Success</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Method 1 (URL copy) works on ALL mobile browsers</li>
          <li>• Method 2 (PWA) gives the best experience once installed</li>
          <li>• Method 3 (manual) is always reliable as backup</li>
          <li>• Keep Session Reminder bookmarked for quick access</li>
          <li>• Test the extraction on a sample UseSession page first</li>
        </ul>
      </div>
    </div>
  )
}