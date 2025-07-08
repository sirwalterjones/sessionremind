'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import MobileManualEntry from '@/components/MobileManualEntry'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'

export default function Home() {
  const { user, loading } = useAuth()
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false)
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false)



  const dataExtractionBookmarkletCode = "javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\\n').map(l=>l.trim()).filter(l=>l.length>0);if(window.location.href.includes('app.usesession.com/sessions/')){const nameMatch=allText.match(/([A-Z][a-z]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][a-z]+)*\\s+[A-Z][a-z]+)(?=\\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/);if(nameMatch){n=nameMatch[1];}const timeMatch=allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);const dayMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);if(timeMatch && dayMatch){t=dayMatch[1]+', '+dayMatch[2]+' at '+timeMatch[1];}else if(dayMatch){t=dayMatch[1]+', '+dayMatch[2];}let sessionTitle='';const titleSelectors=['h1','h2','h3','[class*=\"title\"]','[class*=\"session\"]','[class*=\"booking\"]'];for(const sel of titleSelectors){const els=document.querySelectorAll(sel);for(const el of els){const txt=el.textContent.trim();if(txt && txt.length>10 && txt.length<100 && !txt.match(/^[0-9]/) && !txt.includes('@') && !txt.includes('$') && !txt.toLowerCase().includes('earnings') && !txt.toLowerCase().includes('bookings') && !txt.toLowerCase().includes('views') && !txt.toLowerCase().includes('waitlist') && !txt.toLowerCase().includes('balance') && (txt.match(/\\b20\\d{2}\\b/) || txt.toLowerCase().includes('field') || txt.toLowerCase().includes('summer') || txt.toLowerCase().includes('winter') || txt.toLowerCase().includes('spring') || txt.toLowerCase().includes('fall') || txt.toLowerCase().includes('christmas') || txt.toLowerCase().includes('holiday') || txt.toLowerCase().includes('watermelon') || txt.toLowerCase().includes('sunflower') || txt.toLowerCase().includes('pumpkin') || txt.toLowerCase().includes('beach') || txt.toLowerCase().includes('studio') || txt.toLowerCase().includes('session') || txt.toLowerCase().includes('shoot') || txt.toLowerCase().includes('mini') || txt.toLowerCase().includes('portrait') || txt.toLowerCase().includes('photo'))){sessionTitle=txt;break;}}if(sessionTitle)break;}if(!sessionTitle){const sessionPatterns=[/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\\s+20\\d{2})/gi,/(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\\s+[A-Z][a-z]+)*(?:\\s+20\\d{2})?/gi,/([A-Z][a-z\\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\\s]*)/gi,/(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi,/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s+(?:Mini|Session|Shoot|Portrait|Photo)/gi];for(const pattern of sessionPatterns){const matches=allText.match(pattern);if(matches && matches[0].length>5 && matches[0].length<80){sessionTitle=matches[0].trim();break;}}}if(sessionTitle){s=sessionTitle;}else{s='Photography Session';}}else{for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][a-z]+)*\\s+[A-Z][a-z]+$/gm);if(names){n=names[0];}}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl=window.location.hostname==='localhost'?'http://localhost:3000':'https://sessionremind.com';const targetUrl=`${baseUrl}/new?${params.toString()}`;console.log('Extracted:',{name:n,email:e,phone:p,sessionTitle:s,sessionTime:t});console.log('URL:',targetUrl);window.open(targetUrl,'_blank');alert(`✅ Session data extracted!\\n\\n📝 Name: ${n||'Not found'}\\n📞 Phone: ${p||'Not found'}\\n📧 Email: ${e||'Not found'}\\n📸 Session: ${s||'Not found'}\\n⏰ Time: ${t||'Not found'}\\n\\nThe Session Reminder form is now open in a new tab.`);}catch(err){console.error('Bookmarklet error:',err);alert('❌ Error extracting data. Please try again or use manual entry.');}})()"
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
              Never miss a
              <span className="font-medium block">session again</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Automatically send SMS reminders to your photography clients with seamless UseSession integration
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {loading ? (
                <div className="px-8 py-4 bg-gray-200 text-gray-500 font-medium animate-pulse">
                  Loading...
                </div>
              ) : user ? (
                // Show dashboard links for logged-in users
                <>
                  <a
                    href="/new"
                    className="px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Create Reminder
                  </a>
                  <a
                    href="/dashboard"
                    className="px-8 py-4 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                  >
                    View Dashboard
                  </a>
                </>
              ) : (
                // Show signup/login for non-logged-in users
                <>
                  <a
                    href="/register"
                    className="px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Start Free Trial
                  </a>
                  <a
                    href="/login"
                    className="px-8 py-4 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign In
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Mobile Notice */}
          <div className="block md:hidden mb-16">
            <div className="bg-amber-50 border border-amber-200 p-6 text-center max-w-md mx-auto">
              <h3 className="text-lg font-medium text-amber-900 mb-2">Mobile Device Detected</h3>
              <p className="text-amber-800 mb-4 text-sm">
                For best results, use a desktop or tablet-based browser with full integration options.
              </p>
              <a
                href="/new"
                className="inline-block px-6 py-3 bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors duration-200"
              >
                Continue with Manual Entry
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Integration Methods - Desktop/Tablet Only */}
      <div className="hidden md:block bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">Integration Options</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Extract client data from UseSession automatically
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Bookmarklet - Recommended */}
            <div className="bg-white border-2 border-amber-400 p-8 hover:shadow-lg transition-shadow duration-200 relative">
              <div className="absolute -top-3 left-4 bg-amber-400 text-amber-900 px-3 py-1 text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
              <div className="mb-6 pt-2">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Bookmarklet</h3>
                <p className="text-gray-600 text-sm">
                  Simple one-click solution for desktop browsers
                </p>
              </div>

              <div className="space-y-3 mb-8 text-sm text-gray-600">
                <div>No installation required</div>
                <div>Works on desktop browsers</div>
                <div>One-click bookmark</div>
                <div>Automatic data extraction</div>
                <div>Perfect for everyday use</div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <h4 className="font-medium text-gray-900 mb-4">Drag to Bookmarks Bar</h4>
                  <a 
                    href={dataExtractionBookmarkletCode}
                    className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 cursor-move"
                    draggable="true"
                  >
                    <div className="w-5 h-5 bg-white rounded flex items-center justify-center mr-2">
                      <span className="text-black text-xs font-bold">S</span>
                    </div>
                    ession Remind
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Drag this button to your bookmarks bar
                  </p>
                </div>
                
              </div>
            </div>

            {/* Browser Extension */}
            <div className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Browser Extension</h3>
                <p className="text-gray-600 text-sm">
                  Advanced option with floating button interface
                </p>
              </div>

              <div className="space-y-3 mb-8 text-sm text-gray-600">
                <div>Floating button appears automatically</div>
                <div>Works on all UseSession pages</div>
                <div>Resizable button to avoid page conflicts</div>
                <div>Advanced features for power users</div>
                <div>Requires manual installation</div>
              </div>

              <div className="space-y-3">
                <a 
                  href="/sessionremindext.zip"
                  className="block text-center px-6 py-3 bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors duration-200"
                  download="sessionremindext.zip"
                >
                  Download Extension
                </a>
                <button 
                  onClick={() => {
                    const instructions = `# Chrome Extension Installation Guide

## Step-by-Step Instructions:

1. **Download the Extension**
   - Click the "Download Extension" button above
   - Save the sessionremindext.zip file to your computer

2. **Extract the ZIP File**
   - Right-click on sessionremindext.zip
   - Select "Extract All" or "Unzip"
   - Remember the folder location

3. **Enable Developer Mode in Chrome**
   - Open Google Chrome
   - Type chrome://extensions/ in the address bar
   - Press Enter
   - In the top-right corner, toggle "Developer mode" ON

4. **Load the Extension**
   - Click "Load unpacked" button (appears after enabling developer mode)
   - Navigate to the extracted folder
   - Select the "extension" folder inside
   - Click "Select Folder"

5. **Verify Installation**
   - You should see "Session Reminder" in your extensions list
   - Visit any UseSession page to see the floating button
   - The button shows "S" icon with "Send Text Reminder" text

## Troubleshooting:
- If you don't see "Load unpacked", make sure Developer mode is enabled
- Chrome may show security warnings - this is normal for unpacked extensions
- The extension only works on app.usesession.com pages

## Browser Support:
✅ Chrome, Edge, Brave, and other Chromium browsers`;
                    
                    const blob = new Blob([instructions], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'chrome-extension-installation-guide.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="block text-center px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                >
                  Download Installation Guide
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Simple three-step process to keep your clients informed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white font-medium flex items-center justify-center mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Extract Data</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically captures client name, phone, email, session type, and date from UseSession pages
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white font-medium flex items-center justify-center mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Customize Message</h3>
              <p className="text-gray-600 leading-relaxed">
                Personalize your SMS reminder with client name, session details, and your custom message
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white font-medium flex items-center justify-center mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Send & Schedule</h3>
              <p className="text-gray-600 leading-relaxed">
                Send immediately or schedule automatic reminders 3 days and 1 day before the session
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 mb-16 font-light max-w-2xl mx-auto">
            Professional SMS reminders for your photography business
          </p>
          
          {/* Pricing Card */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 transform hover:scale-105 transition-transform duration-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Professional Plan</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl font-bold text-gray-900">$20</span>
                  <span className="text-xl text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-gray-600">Everything you need for professional client communication</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited SMS reminders
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  UseSession integration
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Automated scheduling
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Dashboard analytics
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom message templates
                </div>
              </div>
              
              <a
                href="/register"
                className="block w-full px-8 py-4 bg-black text-white font-medium text-center hover:bg-gray-800 transition-colors duration-200 rounded-lg"
              >
                Start Free Trial
              </a>
              <p className="text-xs text-gray-500 text-center mt-3">
                No setup fees • Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <p className="text-lg text-gray-600 mb-8">
              Ready to never miss another session?
            </p>
            <a
              href="/login"
              className="inline-block px-8 py-3 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 rounded-lg mr-4"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="inline-block px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200 rounded-lg"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </div>

      {/* Bookmarklet Installation Modal */}
      {showBookmarkletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {bookmarkletCopied ? 'Bookmarklet Copied!' : 'Bookmarklet Installation'}
                </h3>
                {bookmarkletCopied && (
                  <p className="text-green-600 text-sm font-medium">
                    JavaScript code has been copied to your clipboard
                  </p>
                )}
              </div>
              
              {/* Instructions */}
              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {bookmarkletCopied ? 'To install:' : 'Installation options:'}
                </h4>
                
                {bookmarkletCopied ? (
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <div>
                        <strong>Create a bookmark:</strong> Press <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Ctrl+D</kbd> (or <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Cmd+D</kbd> on Mac) to bookmark this page
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <div>
                        <strong>Edit the bookmark:</strong> Change the bookmark name to "Session Remind"
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <div>
                        <strong>Replace the URL:</strong> Paste the copied JavaScript code (Ctrl+V or Cmd+V) to replace the website URL
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                      <div>
                        <strong>Save:</strong> Save the bookmark and visit any UseSession page to test it
                      </div>
                    </li>
                  </ol>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <h5 className="font-semibold text-stone-800 mb-2">Option 1: Drag & Drop</h5>
                      <p className="text-stone-700 text-sm">
                        Drag the "Session Remind" button above to your bookmarks bar
                      </p>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <h5 className="font-semibold text-stone-800 mb-2">Option 2: Manual Installation</h5>
                      <ol className="text-stone-700 text-sm space-y-1">
                        <li>1. Show your bookmarks bar (Ctrl+Shift+B)</li>
                        <li>2. Create a new bookmark</li>
                        <li>3. Name it "Session Remind"</li>
                        <li>4. Copy the JavaScript code from the button above</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowBookmarkletModal(false);
                    setBookmarkletCopied(false);
                  }}
                  className="px-8 py-3 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-colors duration-200"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}