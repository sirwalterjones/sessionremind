'use client'

import React from 'react'
import MobileManualEntry from '@/components/MobileManualEntry'

export default function Instructions() {
  const dataExtractionBookmarkletCode = "javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\\\\n').map(l=>l.trim()).filter(l=>l.length>0);if(window.location.href.includes('app.usesession.com/sessions/')){const nameMatch=allText.match(/([A-Z][a-z]+(?:\\\\s+[A-Z]\\\\.?)*(?:\\\\s+[A-Z][a-z]+)*\\\\s+[A-Z][a-z]+)(?=\\\\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,})/);if(nameMatch){n=nameMatch[1];}const timeMatch=allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);const dayMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);if(timeMatch && dayMatch){t=dayMatch[1]+', '+dayMatch[2]+' at '+timeMatch[1];}else if(dayMatch){t=dayMatch[1]+', '+dayMatch[2];}let sessionTitle='';const titleSelectors=['h1','h2','h3','[class*=\\\"title\\\"]','[class*=\\\"session\\\"]','[class*=\\\"booking\\\"]'];for(const sel of titleSelectors){const els=document.querySelectorAll(sel);for(const el of els){const txt=el.textContent.trim();if(txt && txt.length>10 && txt.length<100 && !txt.match(/^[0-9]/) && !txt.includes('@') && !txt.includes('$') && !txt.toLowerCase().includes('earnings') && !txt.toLowerCase().includes('bookings') && !txt.toLowerCase().includes('views') && !txt.toLowerCase().includes('waitlist') && !txt.toLowerCase().includes('balance') && (txt.match(/\\\\b20\\\\d{2}\\\\b/) || txt.toLowerCase().includes('field') || txt.toLowerCase().includes('summer') || txt.toLowerCase().includes('winter') || txt.toLowerCase().includes('spring') || txt.toLowerCase().includes('fall') || txt.toLowerCase().includes('christmas') || txt.toLowerCase().includes('holiday') || txt.toLowerCase().includes('watermelon') || txt.toLowerCase().includes('sunflower') || txt.toLowerCase().includes('pumpkin') || txt.toLowerCase().includes('beach') || txt.toLowerCase().includes('studio') || txt.toLowerCase().includes('session') || txt.toLowerCase().includes('shoot') || txt.toLowerCase().includes('mini') || txt.toLowerCase().includes('portrait') || txt.toLowerCase().includes('photo'))){sessionTitle=txt;break;}}if(sessionTitle)break;}if(!sessionTitle){const patterns=[/([A-Z][a-z]+(?:\\\\s+[A-Z][a-z]+)*\\\\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\\\\s+20\\\\d{2})/gi,/(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\\\\s+[A-Z][a-z]+)*(?:\\\\s+20\\\\d{2})?/gi,/([A-Z][a-z\\\\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\\\\s]*)/gi,/(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi,/([A-Z][a-z]+(?:\\\\s+[A-Z][a-z]+)*)\\\\s+(?:Mini|Session|Shoot|Portrait|Photo)/gi];for(const pattern of patterns){const matches=allText.match(pattern);if(matches && matches[0].length>5 && matches[0].length<80){sessionTitle=matches[0].trim();break;}}}s=sessionTitle||'Photography Session';}else{for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\\\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\\\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\\\n]*[0-9]{4}[^\\\\n]*[0-9]{1,2}:[0-9]{2}[^\\\\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\\\\n]*[0-9]{4}[^\\\\n]*[0-9]{1,2}:[0-9]{2}[^\\\\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+(?:\\\\s+[A-Z]\\\\.?)*(?:\\\\s+[A-Z][a-z]+)*\\\\s+[A-Z][a-z]+$/gm);if(names){n=names[0];}}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new?'+params.toString(),'_blank');}catch(err){const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new','_blank');}})();"
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-6 sm:mb-8">
            <span className="text-2xl">📖</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight px-4">
            Quick Start Guide
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Get up and running with Session Reminder in just a few simple steps
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Browser Extension Option */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-stone-100">
            <div className="flex items-start sm:items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-stone-800 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg">
                1
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  🚀 Choose Your Integration
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Browser Extension or Bookmarklet</p>
              </div>
            </div>
            
            <div className="ml-0 sm:ml-8 lg:ml-16 space-y-4 sm:space-y-6">
              {/* Extension Option */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6">
                <h3 className="text-stone-800 font-semibold mb-3 text-sm sm:text-base">✨ Browser Extension (Best)</h3>
                <ul className="text-stone-700 text-xs sm:text-sm space-y-1 sm:space-y-2 mb-4">
                  <li>• Floating button appears automatically</li>
                  <li>• Extracts session titles automatically</li>
                  <li>• One-click data extraction</li>
                  <li>• Works on all UseSession pages</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/extension-resizable.zip"
                    className="inline-flex items-center justify-center px-4 py-2 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 text-sm"
                    download="session-reminder-extension-resizable.zip"
                  >
                    <span className="mr-2">⬇️</span>
                    Download Extension
                  </a>
                  <span className="text-stone-600 text-xs sm:text-sm self-center text-center sm:text-left">Install once, works everywhere!</span>
                </div>
              </div>

              {/* Bookmarklet Option */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6">
                <h3 className="text-amber-800 font-semibold mb-3 text-sm sm:text-base">⭐ Bookmarklet (Desktop)</h3>
                <ul className="text-amber-700 text-xs sm:text-sm space-y-1 sm:space-y-2 mb-4">
                  <li>• No installation required</li>
                  <li>• Works on desktop browsers</li>
                  <li>• Copy and paste installation</li>
                  <li>• Automatic data extraction</li>
                </ul>
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-center">
                  <h4 className="font-medium text-amber-900 mb-2 text-sm">📋 Copy to Install</h4>
                  <p className="text-amber-700 text-xs mb-3">
                    Since drag-and-drop is unreliable across browsers, use copy-and-paste:
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(dataExtractionBookmarkletCode).then(() => {
                        alert('✅ Bookmarklet copied!\n\nTo install:\n1. Create a new bookmark (Ctrl+D or Cmd+D)\n2. Name it "Session Remind"\n3. Replace the URL with the copied code\n4. Save and use on UseSession pages!');
                      }).catch(() => {
                        alert('Please manually copy this code and save as a bookmark named "Session Remind":\n\n' + dataExtractionBookmarkletCode);
                      });
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all duration-200 text-sm"
                  >
                    <div className="w-4 h-4 bg-white rounded flex items-center justify-center mr-2">
                      <span className="text-amber-600 text-xs font-bold">S</span>
                    </div>
                    Copy Session Remind
                  </button>
                  <p className="text-amber-700 text-xs mt-2">Copy → New bookmark → Paste as URL → Save</p>
                </div>
              </div>

            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-stone-100">
            <div className="flex items-start sm:items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-stone-700 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg">
                2
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  🎯 Navigate to UseSession
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Find your client's session details</p>
              </div>
            </div>
            <div className="ml-0 sm:ml-8 lg:ml-16 space-y-4">
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">
                Go to any client's session page in UseSession where you can see their contact info and session details.
              </p>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6">
                <h3 className="font-semibold text-stone-800 mb-3 text-sm sm:text-base">📍 Best pages to use:</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-stone-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-stone-700 text-xs sm:text-sm break-words">Individual session pages</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-stone-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-stone-700 text-xs sm:text-sm">Calendar booking details</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-stone-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-stone-700 text-xs sm:text-sm">Client booking confirmations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-stone-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-stone-700 text-xs sm:text-sm">Session management pages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-stone-100">
            <div className="flex items-start sm:items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-stone-600 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg">
                3
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  ✨ Extract Client Data
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Let the automation work its magic</p>
              </div>
            </div>
            <div className="ml-0 sm:ml-8 lg:ml-16 space-y-4">
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">
                Click the extension button or bookmarklet while on the UseSession client page.
              </p>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6">
                <h3 className="font-semibold text-stone-800 mb-3 text-sm sm:text-base">🎉 What gets extracted:</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-stone-700 text-xs sm:text-sm">Client name (e.g., "Jane Doe")</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-stone-700 text-xs sm:text-sm">Phone number</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-stone-700 text-xs sm:text-sm">Email address</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-stone-700 text-xs sm:text-sm break-words">Session title (e.g., "Sunflower Field Summer 2025")</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-stone-700 text-xs sm:text-sm">Session date & time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-stone-100">
            <div className="flex items-start sm:items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-stone-500 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg">
                4
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  🚀 Send or Schedule
                </h2>
                <p className="text-sm sm:text-base text-gray-600">Review, customize, and send</p>
              </div>
            </div>
            <div className="ml-0 sm:ml-8 lg:ml-16 space-y-4">
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">
                Review the pre-filled form, customize your message, and choose between immediate sending or scheduled reminders.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <span className="font-semibold text-stone-800 text-sm sm:text-base">Verify details</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 ml-7 sm:ml-8">Check extracted info</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <span className="font-semibold text-stone-800 text-sm sm:text-base">Customize message</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 ml-7 sm:ml-8">Add personalization</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <span className="font-semibold text-stone-800 text-sm sm:text-base">Confirm opt-in</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 ml-7 sm:ml-8">Toggle switch ON</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                    <span className="font-semibold text-stone-800 text-sm sm:text-base">Send or schedule</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 ml-7 sm:ml-8">Immediate or auto reminders</p>
                </div>
              </div>
            </div>
          </div>

          {/* SMS Workflow */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-start sm:items-center mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-stone-600 text-lg sm:text-xl">📱</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">SMS Workflow</h2>
                <p className="text-sm sm:text-base text-gray-600">How automated reminders work</p>
              </div>
            </div>
            <div className="ml-0 sm:ml-8 lg:ml-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-2 lg:space-x-4 text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span className="text-xs sm:text-sm lg:text-base">Enrollment</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">→</span>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">⚡</span>
                  <span className="text-xs sm:text-sm lg:text-base">Manual Message</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">→</span>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-stone-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-xs sm:text-sm lg:text-base">3-Day Reminder</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">→</span>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-stone-400 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span className="text-xs sm:text-sm lg:text-base">1-Day Reminder</span>
                </div>
              </div>
            </div>
          </div>


          {/* CTA */}
          <div className="text-center pt-8">
            <a
              href="/new"
              className="inline-flex items-center px-8 py-4 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-lg"
            >
              <span className="mr-3">🚀</span>
              Get Started Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}