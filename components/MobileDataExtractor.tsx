'use client'

import React, { useState, useEffect } from 'react'
import { isMobile, isIOS, isAndroid } from '@/utils/device'
import MobileBookmarklet from './MobileBookmarklet'

interface MobileDataExtractorProps {
  onDataExtracted: (data: any) => void
}

export default function MobileDataExtractor({ onDataExtracted }: MobileDataExtractorProps) {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false
  })
  
  const [showTextExtractor, setShowTextExtractor] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  
  useEffect(() => {
    setDeviceInfo({
      isMobile: isMobile(),
      isIOS: isIOS(),
      isAndroid: isAndroid()
    })
  }, [])
  
  const handleTextExtraction = async () => {
    if (!textInput.trim()) return
    
    setIsExtracting(true)
    
    try {
      const input = textInput.trim()
      const extractedData = {
        name: '',
        email: '',
        phone: '',
        sessionTitle: '',
        sessionTime: ''
      }

      // Extract email
      const emailMatch = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        extractedData.email = emailMatch[0]
      }

      // Extract phone
      const phoneMatch = input.match(/[+]?[0-9]{10,15}/)
      if (phoneMatch) {
        extractedData.phone = phoneMatch[0]
      }

      // Extract name - UseSession patterns
      let nameMatch = input.match(/([A-Z][a-z]+(?:\s+[A-Z]\.?)*(?:\s+[A-Z][a-z]+)+)(?=\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
      
      if (!nameMatch) {
        nameMatch = input.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b(?=.*@)/)
      }
      
      if (!nameMatch) {
        nameMatch = input.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m)
      }
      
      if (nameMatch) {
        extractedData.name = nameMatch[1].trim()
      }

      // Extract time
      const timeMatch = input.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/)
      const dayMatch = input.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/)
      
      if (timeMatch && dayMatch) {
        extractedData.sessionTime = `${dayMatch[1]}, ${dayMatch[2]} at ${timeMatch[1]}`
      } else if (dayMatch) {
        extractedData.sessionTime = `${dayMatch[1]}, ${dayMatch[2]}`
      }

      // Extract session title
      const titlePatterns = [
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\s+20\d{2})/gi,
        /(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\s+[A-Z][a-z]+)*(?:\s+20\d{2})?/gi,
        /([A-Z][a-z\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\s]*)/gi
      ]
      
      for (const pattern of titlePatterns) {
        const matches = input.match(pattern)
        if (matches && matches[0].length > 5 && matches[0].length < 80) {
          extractedData.sessionTitle = matches[0].trim()
          break
        }
      }
      
      if (!extractedData.sessionTitle) {
        extractedData.sessionTitle = 'Photography Session'
      }

      onDataExtracted(extractedData)
      setTextInput('')
      setShowTextExtractor(false)
      
    } catch (error) {
      console.error('Error extracting data:', error)
      alert('Error extracting data. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }
  
  const getShareInstructions = () => {
    if (deviceInfo.isIOS) {
      return {
        title: "📱 iOS Share Instructions",
        steps: [
          "1. Open UseSession page in Safari",
          "2. Tap the Share button (box with arrow)",
          "3. Look for 'Session Reminder' in the share sheet",
          "4. Tap it to automatically fill the form",
          "5. If not available, copy the page text and paste below"
        ]
      }
    } else if (deviceInfo.isAndroid) {
      return {
        title: "🤖 Android Share Instructions", 
        steps: [
          "1. Open UseSession page in Chrome",
          "2. Tap the Share button (three dots menu)",
          "3. Look for 'Session Reminder' app",
          "4. Tap it to automatically fill the form",
          "5. If not available, copy the page text and paste below"
        ]
      }
    } else {
      return {
        title: "🖥️ Desktop Instructions",
        steps: [
          "1. Use the bookmarklet from your bookmarks bar",
          "2. Or copy the UseSession page text",
          "3. Paste it in the text box below",
          "4. Click 'Extract Data' to auto-fill the form"
        ]
      }
    }
  }
  
  const instructions = getShareInstructions()
  
  const simpleBookmarkletCode = `javascript:(function(){
    const text = document.body.innerText;
    const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/);
    const phone = text.match(/[+]?[0-9]{10,15}/);
    const nameMatch = text.match(/([A-Z][a-z]+\\s+[A-Z][a-z]+)/);
    const timeMatch = text.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);
    const dayMatch = text.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);
    let sessionTime = '';
    if (timeMatch && dayMatch) {
      sessionTime = dayMatch[1] + ', ' + dayMatch[2] + ' at ' + timeMatch[1];
    } else if (dayMatch) {
      sessionTime = dayMatch[1] + ', ' + dayMatch[2];
    }
    const params = new URLSearchParams({
      name: nameMatch ? nameMatch[1] : '',
      email: email ? email[0] : '',
      phone: phone ? phone[0] : '',
      sessionTime: sessionTime,
      sessionTitle: sessionTime ? (sessionTime.includes('July') ? 'July Photography Session' : 'Photography Session') : 'Photography Session'
    });
    window.open('${typeof window !== 'undefined' ? window.location.origin : ''}/new?' + params.toString(), '_blank');
  })();`
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-2">📱 Extract from UseSession</h3>
        <p className="text-blue-700 text-sm">
          {deviceInfo.isMobile ? "Mobile-optimized data extraction" : "Quick data extraction methods"}
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Method 1: Bookmarklet */}
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <span className="text-green-600 text-2xl">⚡</span>
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-2">
                {deviceInfo.isMobile ? "Method 1: Bookmark" : "Method 1: Bookmarklet"}
              </h4>
              <p className="text-green-800 text-sm mb-3">
                {deviceInfo.isMobile 
                  ? "Save this link as a bookmark, then use it on UseSession pages"
                  : "Drag this to your bookmarks bar for one-click extraction"
                }
              </p>
              <MobileBookmarklet bookmarkletCode={simpleBookmarkletCode} />
            </div>
          </div>
        </div>

        {/* Method 2: Share Target (Mobile) or Copy-Paste */}
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 text-2xl">
              {deviceInfo.isMobile ? "📤" : "📋"}
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-2">
                {deviceInfo.isMobile ? "Method 2: Share to App" : "Method 2: Copy & Paste"}
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                {deviceInfo.isMobile
                  ? "If you have the app installed, share UseSession pages directly"
                  : "Copy the UseSession page text and paste it below"
                }
              </p>
              
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <h5 className="font-medium text-blue-900 mb-2">{instructions.title}</h5>
                <ul className="text-blue-700 text-sm space-y-1">
                  {instructions.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => setShowTextExtractor(!showTextExtractor)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                {showTextExtractor ? "Hide" : "Show"} Text Paste Option
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Text Extractor */}
      {showTextExtractor && (
        <div className="bg-white rounded-xl p-4 border border-blue-100 mt-4">
          <h4 className="font-bold text-blue-900 mb-3">📝 Paste UseSession Text</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste the UseSession page text here:
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Paste the text from the UseSession page here..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleTextExtraction}
                disabled={!textInput.trim() || isExtracting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExtracting ? "Extracting..." : "🔍 Extract Data"}
              </button>
              
              <button
                onClick={() => {
                  setTextInput('')
                  setShowTextExtractor(false)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}