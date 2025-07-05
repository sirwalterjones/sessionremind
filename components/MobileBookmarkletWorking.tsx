'use client'

import React, { useState, useEffect } from 'react'

interface MobileBookmarkletWorkingProps {
  bookmarkletCode: string
}

export default function MobileBookmarkletWorking({ bookmarkletCode }: MobileBookmarkletWorkingProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showFullInstructions, setShowFullInstructions] = useState(false)
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const mobile = /android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
    const ios = /ipad|iphone|ipod/.test(userAgent)
    const android = /android/.test(userAgent)
    
    setIsMobile(mobile)
    setIsIOS(ios)
    setIsAndroid(android)
  }, [])
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode)
      alert('✅ Bookmarklet code copied!\n\nNow:\n1. Open your browser bookmarks\n2. Add new bookmark\n3. Paste the code as URL\n4. Name it "Session Remind"\n5. Use it on UseSession pages!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = bookmarkletCode
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('✅ Bookmarklet code copied!\n\nNow:\n1. Open your browser bookmarks\n2. Add new bookmark\n3. Paste the code as URL\n4. Name it "Session Remind"\n5. Use it on UseSession pages!')
      } catch (fallbackErr) {
        alert('❌ Copy failed. Please manually copy the code from the text box below.')
        setShowFullInstructions(true)
      }
      document.body.removeChild(textArea)
    }
  }
  
  const getDeviceInstructions = () => {
    if (isIOS) {
      return {
        title: "📱 iOS Setup Instructions",
        quickSteps: [
          "1. Tap 'Copy Code' button below",
          "2. Open Safari bookmarks (Bookmarks icon)",
          "3. Tap 'Edit' → '+' to add bookmark",
          "4. Paste code as URL, name 'Session Remind'",
          "5. Save and use on UseSession pages!"
        ],
        detailedSteps: [
          "Detailed iOS Steps:",
          "• Open Safari and go to any webpage",
          "• Tap the share button (box with arrow up)",
          "• Scroll and tap 'Add Bookmark'",
          "• Change the URL to the copied bookmarklet code",
          "• Name it 'Session Remind'",
          "• Choose 'Bookmarks' folder",
          "• Tap 'Save'",
          "• Access via Bookmarks menu on UseSession pages"
        ]
      }
    } else if (isAndroid) {
      return {
        title: "🤖 Android Setup Instructions",
        quickSteps: [
          "1. Tap 'Copy Code' button below",
          "2. Open Chrome menu (⋮) → Bookmarks",
          "3. Tap '+' to add bookmark",
          "4. Paste code as URL, name 'Session Remind'",
          "5. Save and use on UseSession pages!"
        ],
        detailedSteps: [
          "Detailed Android Steps:",
          "• Open Chrome browser",
          "• Tap the three dots menu (⋮)",
          "• Select 'Bookmarks'",
          "• Tap the '+' or 'Add' button",
          "• In 'URL' field, paste the bookmarklet code",
          "• Name it 'Session Remind'",
          "• Tap 'Save'",
          "• Access via Bookmarks on UseSession pages"
        ]
      }
    } else {
      return {
        title: "🖥️ Desktop Setup Instructions",
        quickSteps: [
          "1. Show your bookmarks bar (Ctrl+Shift+B)",
          "2. Drag the button below to bookmarks bar",
          "3. Or right-click → 'Copy Link'",
          "4. Create bookmark and paste as URL",
          "5. Use on UseSession pages!"
        ],
        detailedSteps: [
          "Desktop browsers support drag-and-drop.",
          "If dragging doesn't work, copy the link manually."
        ]
      }
    }
  }
  
  const instructions = getDeviceInstructions()
  
  return (
    <div className="space-y-4">
      {/* Main bookmarklet section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-bold text-blue-900 mb-3 text-sm sm:text-base">
          {instructions.title}
        </h4>
        
        {/* Quick steps */}
        <ul className="text-blue-800 text-xs sm:text-sm space-y-1 mb-4">
          {instructions.quickSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopyCode}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            📋 Copy Bookmarklet Code
          </button>
          
          {isMobile && (
            <button
              onClick={() => setShowFullInstructions(!showFullInstructions)}
              className="w-full px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              {showFullInstructions ? 'Hide' : 'Show'} Detailed Instructions
            </button>
          )}
          
          {/* Desktop drag option */}
          {!isMobile && (
            <div className="text-center">
              <p className="text-blue-700 text-xs mb-2">Or drag this button to your bookmarks bar:</p>
              <a
                href={bookmarkletCode}
                title="Session Remind"
                className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors"
                draggable="true"
                onClick={(e) => e.preventDefault()}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/uri-list', bookmarkletCode);
                  e.dataTransfer.setData('text/plain', 'Session Remind');
                  e.dataTransfer.setData('text/x-moz-url', `${bookmarkletCode}\nSession Remind`);
                  e.dataTransfer.setData('text/html', `<a href="${bookmarkletCode}">Session Remind</a>`);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="w-4 h-4 bg-white rounded flex items-center justify-center mr-2">
                  <span className="text-blue-700 text-xs font-bold">S</span>
                </div>
                Session Remind
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed instructions for mobile */}
      {showFullInstructions && isMobile && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h5 className="font-bold text-green-900 mb-3 text-sm">📖 Step-by-Step Guide</h5>
          <ul className="text-green-800 text-xs space-y-2">
            {instructions.detailedSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium text-xs mb-1">💡 Pro Tip:</p>
            <p className="text-yellow-700 text-xs">
              After saving, go to any UseSession client page and tap your "Session Remind" bookmark. 
              It will automatically extract the client data and open the reminder form!
            </p>
          </div>
        </div>
      )}
      
      {/* Manual code display for troubleshooting */}
      {showFullInstructions && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h5 className="font-bold text-gray-900 mb-2 text-sm">🔧 Manual Copy (if needed)</h5>
          <textarea
            value={bookmarkletCode}
            readOnly
            className="w-full h-24 p-2 border border-gray-300 rounded text-xs font-mono resize-none"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          <p className="text-gray-600 text-xs mt-2">
            Tap inside the box above to select all text, then copy and paste as bookmark URL.
          </p>
        </div>
      )}
    </div>
  )
}