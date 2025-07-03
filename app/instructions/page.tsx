'use client'

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-8">
            <span className="text-2xl">📖</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Quick Start Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get up and running with Session Reminder in just a few simple steps
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Browser Extension Option */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                1
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">🚀 Choose Your Integration Method</h2>
                <p className="text-gray-600">Browser Extension (Recommended) or Bookmarklet</p>
              </div>
            </div>
            
            <div className="ml-16 space-y-6">
              {/* Extension Option */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                <h3 className="text-emerald-800 font-semibold mb-3">✨ Browser Extension (Best Experience)</h3>
                <ul className="text-emerald-700 text-sm space-y-2 mb-4">
                  <li>• Floating button appears automatically on UseSession pages</li>
                  <li>• Extracts session titles like "Sunflower Field Summer 2025"</li>
                  <li>• One-click data extraction and form opening</li>
                  <li>• Works across all UseSession pages</li>
                </ul>
                <div className="flex gap-3">
                  <a 
                    href="/extension"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition-all duration-200"
                    download="session-reminder-extension.zip"
                  >
                    <span className="mr-2">⬇️</span>
                    Download Extension
                  </a>
                  <span className="text-emerald-600 text-sm self-center">Install once, works everywhere!</span>
                </div>
              </div>

              {/* Bookmarklet Option */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                <h3 className="text-stone-800 font-semibold mb-3">🔗 Bookmarklet (Quick Start)</h3>
                <p className="text-stone-700 text-sm mb-4">
                  Drag this button to your bookmarks bar for instant setup:
                </p>
                <a 
                  href="javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\\n').map(l=>l.trim()).filter(l=>l.length>0);if(window.location.href.includes('app.usesession.com/sessions/')){const nameMatch=allText.match(/([A-Z][a-z]+ [A-Z][a-z]+)(?=\\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/);if(nameMatch){n=nameMatch[1];}const timeMatch=allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);const dayMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);if(timeMatch && dayMatch){t=dayMatch[1]+', '+dayMatch[2]+' at '+timeMatch[1];}else if(dayMatch){t=dayMatch[1]+', '+dayMatch[2];}let sessionTitle='';const titleSelectors=['h1','h2','h3','[class*=\"title\"]','[class*=\"session\"]'];for(const sel of titleSelectors){const els=document.querySelectorAll(sel);for(const el of els){const txt=el.textContent.trim();if(txt && txt.length>5 && txt.length<100 && !txt.match(/^[0-9]/) && !txt.includes('@') && !txt.includes('$') && (txt.toLowerCase().includes('session')||txt.toLowerCase().includes('shoot')||txt.toLowerCase().includes('mini')||txt.toLowerCase().includes('portrait')||txt.toLowerCase().includes('photo'))){sessionTitle=txt;break;}}if(sessionTitle)break;}if(!sessionTitle){const patterns=[/([A-Z][a-z\\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\\s]*)/gi,/(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi];for(const pattern of patterns){const matches=allText.match(pattern);if(matches && matches[0].length>5 && matches[0].length<80){sessionTitle=matches[0].trim();break;}}}s=sessionTitle||'Photography Session';}else{for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/gm);if(names){n=names[0];}}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new?'+params.toString(),'_blank');}catch(err){const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new','_blank');}})();"
                  className="inline-flex items-center px-4 py-2 bg-stone-700 text-white font-medium rounded-full hover:bg-stone-800 transition-all duration-200 cursor-move"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="mr-2">📱</span>
                  UseSession → Session Reminder
                  <span className="ml-2">✨</span>
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-stone-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                2
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">🎯 Navigate to UseSession</h2>
                <p className="text-gray-600">Find your client's session details</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-gray-700 text-lg">
                Go to any client's session page in UseSession where you can see their contact info and session details.
              </p>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                <h3 className="font-semibold text-stone-800 mb-3">📍 Best pages to use:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-stone-700">Individual session pages (app.usesession.com/sessions/...)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-stone-700">Calendar booking details</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-stone-700">Client booking confirmations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-stone-700">Session management pages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-stone-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
                3
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">✨ Extract Client Data</h2>
                <p className="text-gray-600">Let the automation work its magic</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-gray-700 text-lg">
                Click the extension button or bookmarklet while on the UseSession client page.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="font-semibold text-emerald-800 mb-3">🎉 What gets automatically extracted:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-emerald-700">Client name (e.g., "Emily Mico")</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-emerald-700">Phone number</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-emerald-700">Email address</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-emerald-700">Session title (e.g., "Sunflower Field Summer 2025")</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-emerald-700">Session date & time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                4
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">🚀 Send or Schedule Reminders</h2>
                <p className="text-gray-600">Review, customize, and send</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-gray-700 text-lg">
                Review the pre-filled form, customize your message, and choose between immediate sending or scheduled reminders.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span className="font-semibold text-stone-800">Verify client details</span>
                  </div>
                  <p className="text-sm text-stone-700 ml-8">Check all extracted information</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-stone-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="font-semibold text-stone-800">Customize message</span>
                  </div>
                  <p className="text-sm text-stone-700 ml-8">Personalize with {'{name}'}, {'{sessionTitle}'}, etc.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="font-semibold text-emerald-800">Confirm opt-in</span>
                  </div>
                  <p className="text-sm text-emerald-700 ml-8">Toggle "Client has opted in" switch ON</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span className="font-semibold text-amber-800">Send or schedule</span>
                  </div>
                  <p className="text-sm text-amber-700 ml-8">Immediate or automatic 3-day/1-day reminders</p>
                </div>
              </div>
            </div>
          </div>

          {/* SMS Workflow */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center">
                <span className="text-stone-600 text-xl">📱</span>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">SMS Workflow</h2>
                <p className="text-gray-600">How automated reminders work</p>
              </div>
            </div>
            <div className="ml-16">
              <div className="flex items-center space-x-4 text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Enrollment Confirmation</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 bg-stone-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>3-Day Reminder</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>1-Day Reminder</span>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🔧</span>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Troubleshooting</h2>
                <p className="text-gray-600">Common issues and quick fixes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border border-red-100">
                <h3 className="font-semibold text-gray-800 mb-2">🤔 Missing session title</h3>
                <p className="text-sm text-gray-600">Extension may show "Photography Session" - manually update with the actual session name.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-100">
                <h3 className="font-semibold text-gray-800 mb-2">📱 SMS not sending</h3>
                <p className="text-sm text-gray-600">Check opt-in toggle is ON and phone number is correct. Verify TextMagic credentials in Vercel.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-100">
                <h3 className="font-semibold text-gray-800 mb-2">🚫 Extension not working</h3>
                <p className="text-sm text-gray-600">Make sure you're on an individual UseSession session page, not the main dashboard.</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-100">
                <h3 className="font-semibold text-gray-800 mb-2">⏰ Scheduled reminders not sending</h3>
                <p className="text-sm text-gray-600">Use the manual "Run Cron Job" button in the dashboard to process scheduled messages.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <a
              href="/"
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