'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-context'
import MobileManualEntry from '@/components/MobileManualEntry'

export default function Instructions() {
  const { user } = useAuth()
  const dataExtractionBookmarkletCode = "javascript:(function(){try{const allText=document.body.innerText;let clientName='',email='',phone='',sessionTitle='',sessionTime='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);if(emails){email=emails[0];}const phones=allText.match(/\\b\\+?1?[-. ]?\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\\b/g);if(phones){phone=phones[0].replace(/[-. ()]/g,'');}if(window.location.href.includes('app.usesession.com')){const nameElements=document.querySelectorAll('h1, h2, h3, .client-name, [class*=\"name\"], [class*=\"client\"]');for(const el of nameElements){const text=el.textContent.trim();if(text && text.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && !text.includes('@') && !text.includes('Session') && !text.includes('Mini') && !text.includes('Photo')){clientName=text;break;}}if(!clientName){const nameMatch=allText.match(/\\b([A-Z][a-z]+ [A-Z][a-z]+)\\b(?=.*@|.*\\d{3}.*\\d{3}.*\\d{4})/);if(nameMatch){clientName=nameMatch[1];}}const titleElements=document.querySelectorAll('h1, h2, h3, .session-title, [class*=\"title\"], [class*=\"session\"]');for(const el of titleElements){const text=el.textContent.trim();if(text && text.length>5 && text.length<80 && (text.includes('Mini') || text.includes('Session') || text.includes('Photo') || text.includes('Portrait') || text.includes('Shoot') || text.includes('2024') || text.includes('2025') || text.includes('Watermelon') || text.includes('Sunflower') || text.includes('Pumpkin') || text.includes('Christmas') || text.includes('Holiday') || text.includes('Beach') || text.includes('Studio') || text.includes('Family') || text.includes('Senior') || text.includes('Wedding') || text.includes('Maternity') || text.includes('Newborn'))){sessionTitle=text;break;}}if(!sessionTitle){const titleMatch=allText.match(/\\b((?:Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Family|Senior|Wedding|Maternity|Newborn|Summer|Winter|Spring|Fall)[^\\n]*(?:Mini|Session|Shoot|Portrait|Photo|Photography)[^\\n]*(?:2024|2025)?)/i);if(titleMatch){sessionTitle=titleMatch[1];}}const timeMatch=allText.match(/(\\d{1,2}:\\d{2} [AP]M)/);const dateMatch=allText.match(/\\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ \\d{1,2}(?:st|nd|rd|th), \\d{4})/);if(timeMatch && dateMatch){sessionTime=dateMatch[1]+', '+dateMatch[2]+' at '+timeMatch[1];}else if(dateMatch){sessionTime=dateMatch[1]+', '+dateMatch[2];}else if(timeMatch){sessionTime='at '+timeMatch[1];}if(!sessionTitle){sessionTitle='Photography Session';}}else{const lines=allText.split('\\n').map(l=>l.trim()).filter(l=>l.length>0);for(const line of lines){if(line.match(/[A-Z][a-z]+ [A-Z][a-z]+/) && !line.includes('@') && !line.includes('$') && line.length<50){clientName=line.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)[1];break;}}for(const line of lines){if(line.match(/(Mini|Session|Shoot|Photo|Portrait|Photography|Maternity|Newborn|Family|Senior|Wedding|Beach|Studio|Holiday|Christmas|Watermelon|Sunflower|Pumpkin)/i) && line.length>5 && line.length<80){sessionTitle=line.trim();break;}}const dateTimeMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*\\d{4}[^\\n]*\\d{1,2}:\\d{2}[^\\n]*(AM|PM)/i);if(dateTimeMatch){sessionTime=dateTimeMatch[0];}if(!sessionTitle){sessionTitle='Photography Session';}}const params=new URLSearchParams();if(clientName)params.set('name',clientName);if(email)params.set('email',email);if(phone)params.set('phone',phone);if(sessionTitle)params.set('sessionTitle',sessionTitle);if(sessionTime)params.set('sessionTime',sessionTime);const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new?'+params.toString(),'_blank');}catch(err){const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new','_blank');}})();"
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-8 shadow-lg">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Let's Get You Started!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your photography workflow in just 3 easy steps. No technical experience needed!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>2 minutes setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Works with UseSession</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Automatic reminders</span>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              New to Browser Tools?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't worry! Watch these quick videos to understand both bookmarklets and browser extensions. Choose what works best for you!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bookmarklet Video */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-3">
                  <span className="text-white text-xl">🔖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How Bookmarklets Work</h3>
                <p className="text-sm text-gray-600">Simple drag-and-drop installation</p>
              </div>
              
              <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/4FMZmg3zh4s"
                  title="What is bookmarklet and how to create one"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 text-center">
                  <span className="font-semibold">🎯 Recommended:</span> Shows exactly how our Session Reminder bookmarklet works!
                </p>
              </div>
            </div>
            
            {/* Browser Extension Video */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-full mb-3">
                  <span className="text-white text-xl">🧩</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How Browser Extensions Work</h3>
                <p className="text-sm text-gray-600">Download and install process</p>
              </div>
              
              <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/8Xuie8JX-uM"
                  title="How to Install Browser Extensions"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 text-center">
                  <span className="font-semibold">⚠️ Beta Version:</span> Our extension is currently in testing phase
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Pro Tip:</span> Start with the bookmarklet (left video) - it's easier and more reliable. 
                You can always try the extension later if you want advanced features!
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 text-white mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Why Session Reminder?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                <p className="text-white text-opacity-90">Automated reminders mean no more manual follow-ups</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Reduce No-Shows</h3>
                <p className="text-white text-opacity-90">Gentle reminders keep your sessions on track</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional</h3>
                <p className="text-white text-opacity-90">Branded SMS messages that look polished</p>
              </div>
            </div>
          </div>
        </div>

        {/* Choose Your Method */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-6">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Method</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pick the option that works best for you. Both methods extract client data automatically!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookmarklet Option */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🔖</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Bookmarklet</h3>
                  <p className="text-green-600">Simple and reliable</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-green-700">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</span>
                  <span>No installation required</span>
                </div>
                <div className="flex items-center text-green-700">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</span>
                  <span>Works instantly</span>
                </div>
                <div className="flex items-center text-green-700">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</span>
                  <span>Just drag to bookmarks</span>
                </div>
              </div>

              {user ? (
                <div className="bg-white border-2 border-dashed border-green-300 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-green-900 mb-3">🎯 Ready to Install</h4>
                  <a 
                    href={dataExtractionBookmarkletCode}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-move"
                    draggable="true"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg">⬛</span>
                    </div>
                    Session Reminder
                  </a>
                  <p className="text-green-700 text-sm mt-3">👆 Drag this to your bookmarks bar</p>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-blue-900 mb-3">🔐 Login Required</h4>
                  <p className="text-blue-700 text-sm mb-4">Please log in to access your bookmarklet</p>
                  <a 
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Login to Get Started
                  </a>
                </div>
              )}
            </div>

            {/* Extension Option */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🧩</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-800">Browser Extension</h3>
                  <p className="text-amber-600">Advanced features (Beta)</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-amber-700">
                  <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</span>
                  <span>Automatic detection</span>
                </div>
                <div className="flex items-center text-amber-700">
                  <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs mr-3">✓</span>
                  <span>Floating button</span>
                </div>
                <div className="flex items-center text-amber-700">
                  <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs mr-3">⚠</span>
                  <span>Currently in beta</span>
                </div>
              </div>

              {user ? (
                <div className="bg-white border-2 border-amber-200 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-amber-900 mb-3">🚀 Download Extension</h4>
                  <a 
                    href="/extension-resizable.zip"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    download="session-reminder-extension.zip"
                  >
                    <span className="mr-2">⬇️</span>
                    Download Extension
                  </a>
                  <p className="text-amber-700 text-sm mt-3">Beta version - use bookmarklet for stable experience</p>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-blue-900 mb-3">🔐 Login Required</h4>
                  <p className="text-blue-700 text-sm mb-4">Please log in to download the extension</p>
                  <a 
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Login to Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-12">
          
          {/* Step 1 - Use on UseSession */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-xl mr-4">
                1
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Go to UseSession</h2>
                <p className="text-gray-600">Find your client's session page</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">✨ Perfect Pages to Use:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">📄</span>
                      </div>
                      <span className="text-gray-700">Individual client session pages</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">📅</span>
                      </div>
                      <span className="text-gray-700">Calendar booking details</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">✉️</span>
                      </div>
                      <span className="text-gray-700">Booking confirmations</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <span className="text-yellow-600 text-xl mr-3">💡</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Pro Tip</h4>
                      <p className="text-yellow-700 text-sm">Make sure you can see the client's name, phone, and session details on the page before using the tool.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">🖥️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">UseSession Page</h3>
                <p className="text-gray-600 text-sm">Navigate to any client session page where you can see their contact information and booking details.</p>
              </div>
            </div>
          </div>

          {/* Step 2 - Extract and Send */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-xl mr-4">
                2
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Extract & Send</h2>
                <p className="text-gray-600">One click to magic!</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">🎯 What Gets Extracted:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-green-700">Client name & contact info</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-green-700">Session title & details</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-green-700">Date & time information</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6">
                  <h4 className="font-semibold text-pink-800 mb-3">📱 SMS Reminder Flow</h4>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">1</div>
                      <span className="text-pink-700">Enrollment</span>
                    </div>
                    <div className="text-pink-400">→</div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">⚡</div>
                      <span className="text-pink-700">Manual SMS</span>
                    </div>
                    <div className="text-pink-400">→</div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">2</div>
                      <span className="text-pink-700">3-Day Alert</span>
                    </div>
                    <div className="text-pink-400">→</div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">3</div>
                      <span className="text-pink-700">1-Day Alert</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Automatic Magic</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs mr-3">1</span>
                    <span className="text-indigo-700">Click your bookmarklet/extension</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs mr-3">2</span>
                    <span className="text-indigo-700">Review pre-filled form</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs mr-3">3</span>
                    <span className="text-indigo-700">Customize your message</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs mr-3">4</span>
                    <span className="text-indigo-700">Send or schedule reminders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
              <p className="text-xl mb-8 text-purple-100">
                Join hundreds of photographers who've streamlined their client communication with Session Reminder.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <a
                  href="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  <span className="mr-3">🚀</span>
                  Get Started Free
                </a>
                {user && (
                  <a
                    href="/new"
                    className="inline-flex items-center px-8 py-4 bg-purple-500 bg-opacity-30 text-white font-bold rounded-full hover:bg-opacity-40 transition-all duration-200 border-2 border-white border-opacity-30 text-lg"
                  >
                    <span className="mr-3">✨</span>
                    Create Your First Reminder
                  </a>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Setup in under 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}