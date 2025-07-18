'use client'

import React, { useState, useEffect } from 'react'
import { isMobile, isIOS, isAndroid, getBookmarkletInstructions } from '@/utils/device'

interface MobileBookmarkletProps {
  bookmarkletCode: string
}

export default function MobileBookmarklet({ bookmarkletCode }: MobileBookmarkletProps) {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    instructions: getBookmarkletInstructions()
  })
  
  const [showInstructions, setShowInstructions] = useState(false)
  
  useEffect(() => {
    setDeviceInfo({
      isMobile: isMobile(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      instructions: getBookmarkletInstructions()
    })
  }, [])
  
  const handleBookmarkletClick = (e: React.MouseEvent) => {
    if (deviceInfo.isMobile) {
      e.preventDefault()
      setShowInstructions(true)
    }
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode)
      alert('✅ Bookmarklet copied!\n\nTo install:\n1. Create a new bookmark (Ctrl+D or Cmd+D)\n2. Name it "Session Remind"\n3. Replace the URL with the copied code\n4. Save and use on UseSession pages!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Please manually copy this code and save as a bookmark named "Session Remind":\n\n' + bookmarkletCode)
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Mobile-optimized bookmarklet button */}
      <div className="text-center">
        <a 
          href={bookmarkletCode}
          className="inline-flex items-center px-4 py-3 bg-stone-700 text-white font-medium rounded-full hover:bg-stone-800 transition-all duration-200 text-sm break-words max-w-full"
          draggable="true"
          title={deviceInfo.isMobile ? "Tap for mobile instructions" : "Session Remind - Drag this to your bookmarks bar"}
          onClick={handleBookmarkletClick}
          onDragStart={(e) => {
            if (!deviceInfo.isMobile) {
              // The most reliable way is to use text/x-moz-url format with proper title
              // Format: URL\nTitle
              const mozUrl = `${bookmarkletCode}\nSession Remind`;
              
              // Clear all data first
              e.dataTransfer.clearData();
              
              // Set the essential formats for bookmark creation
              e.dataTransfer.setData('text/x-moz-url', mozUrl);
              e.dataTransfer.setData('text/uri-list', bookmarkletCode);
              e.dataTransfer.setData('text/plain', mozUrl);
              e.dataTransfer.setData('text/html', `<a href="${bookmarkletCode}">Session Remind</a>`);
              
              e.dataTransfer.effectAllowed = 'copy';
            }
          }}
        >
          <span className="mr-2">📱</span>
          <span className="truncate">
            {deviceInfo.isMobile ? "Session Remind" : "UseSession → Session Remind"}
          </span>
          <span className="ml-2">✨</span>
        </a>
      </div>
      
      {/* Mobile instructions */}
      {deviceInfo.isMobile && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-blue-800 font-medium mb-2 flex items-center">
            <span className="mr-2">📱</span>
            {deviceInfo.instructions.title}
          </h4>
          <ul className="text-blue-700 text-sm space-y-1 mb-4">
            {deviceInfo.instructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <div className="space-y-2">
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
            >
              📋 Copy Bookmarklet Code
            </button>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-full hover:bg-blue-50 transition-colors text-sm"
            >
              {showInstructions ? 'Hide' : 'Show'} Detailed Instructions
            </button>
          </div>
        </div>
      )}
      
      {/* Detailed instructions for mobile */}
      {showInstructions && deviceInfo.isMobile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-amber-800 font-medium mb-2">
            📖 Detailed Mobile Setup
          </h4>
          <div className="text-amber-700 text-sm space-y-3">
            <div>
              <p className="font-medium">Method 1: Copy & Paste</p>
              <ol className="ml-4 mt-1 space-y-1">
                <li>1. Tap "Copy Bookmarklet Code" above</li>
                <li>2. Open your browser's bookmark manager</li>
                <li>3. Add a new bookmark</li>
                <li>4. Paste the code as the URL</li>
                <li>5. Name it "Session Remind"</li>
              </ol>
            </div>
            
            {deviceInfo.isIOS && (
              <div>
                <p className="font-medium">Method 2: Safari Share</p>
                <ol className="ml-4 mt-1 space-y-1">
                  <li>1. Long-press the bookmarklet button</li>
                  <li>2. Select "Add to Reading List"</li>
                  <li>3. Or select "Add Bookmark"</li>
                  <li>4. Choose your bookmarks folder</li>
                </ol>
              </div>
            )}
            
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
              <p className="font-medium text-amber-800">💡 Pro Tip:</p>
              <p className="text-amber-700 text-xs mt-1">
                Once saved, visit any UseSession page and tap your "Session Remind" bookmark to automatically extract client data!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop instructions */}
      {!deviceInfo.isMobile && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <h4 className="text-stone-800 font-medium mb-2">🖥️ Desktop Setup</h4>
          <p className="text-stone-700 text-sm mb-3">
            Drag the button above to your bookmarks bar, or use manual setup:
          </p>
          <ol className="text-stone-700 text-sm space-y-1">
            <li>1. Right-click the button above → "Copy link"</li>
            <li>2. Add new bookmark in your browser</li>
            <li>3. Paste the copied link as the URL</li>
            <li>4. Name it "Session Remind"</li>
          </ol>
        </div>
      )}
    </div>
  )
}