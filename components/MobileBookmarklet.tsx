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
    e.preventDefault()
    copyToClipboard()
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
                <button 
          data-bookmarklet={bookmarkletCode}
          className="inline-flex items-center px-4 py-3 bg-stone-700 text-white font-medium rounded-full hover:bg-stone-800 transition-all duration-200 text-sm break-words max-w-full cursor-pointer"
          title={deviceInfo.isMobile ? "Tap to copy bookmarklet" : "Copy Session Remind bookmarklet"}
          onClick={() => {
            copyToClipboard();
          }}
                  >
            <span className="mr-2">📋</span>
            <span className="truncate">
              Copy Session Remind
            </span>
            <span className="ml-2">✨</span>
          </button>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-blue-800 font-medium mb-2 flex items-center">
          <span className="mr-2">📋</span>
          How to Install
        </h4>
        <ol className="text-blue-700 text-sm space-y-1 mb-4">
          <li>1. Tap the button above to copy the bookmarklet code</li>
          <li>2. Create a new bookmark in your browser</li>
          <li>3. Name it "Session Remind"</li>
          <li>4. Replace the URL with the copied code</li>
          <li>5. Save and use on UseSession pages!</li>
        </ol>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
        >
          {showInstructions ? 'Hide' : 'Show'} Detailed Instructions
        </button>
      </div>
      
      {/* Detailed instructions */}
      {showInstructions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-amber-800 font-medium mb-2">
            📖 Detailed Setup Instructions
          </h4>
          <div className="text-amber-700 text-sm space-y-3">
            <div>
              <p className="font-medium">Step-by-Step Guide:</p>
              <ol className="ml-4 mt-1 space-y-1">
                <li>1. Tap "Copy Session Remind" button above</li>
                <li>2. Open your browser's bookmark manager</li>
                <li>3. Add a new bookmark</li>
                <li>4. Name it "Session Remind"</li>
                <li>5. Replace the URL with the copied code</li>
                <li>6. Save the bookmark</li>
              </ol>
            </div>
            
            {deviceInfo.isIOS && (
              <div>
                <p className="font-medium">For Safari on iOS:</p>
                <ol className="ml-4 mt-1 space-y-1">
                  <li>1. After copying, open Safari</li>
                  <li>2. Tap the share button</li>
                  <li>3. Select "Add Bookmark"</li>
                  <li>4. Replace the URL with the copied code</li>
                  <li>5. Name it "Session Remind"</li>
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
    </div>
  )
}