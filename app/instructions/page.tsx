'use client'

export default function Instructions() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6">
            <span className="text-3xl">📖</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Quick Start Guide
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get up and running with Session Reminder in just 4 simple steps
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-slate-800">🔖 Set Up the Magic Bookmark</h3>
                <p className="text-slate-600">Add our one-click automation to your browser</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-slate-700 text-lg">
                First, grab our special bookmark that will automatically extract client info from UseSession.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <p className="text-blue-800 font-semibold mb-4">🎯 Drag this bookmarklet to your bookmarks bar:</p>
                <a 
                  href="javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\n').map(l=>l.trim()).filter(l=>l.length>0);for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\n]*[0-9]{4}[^\n]*[0-9]{1,2}:[0-9]{2}[^\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\n]*[0-9]{4}[^\n]*[0-9]{1,2}:[0-9]{2}[^\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/gm);if(names){n=names[0];}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new?'+params.toString(),'_blank');}catch(err){const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new','_blank');}})();"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 cursor-move border-2 border-blue-300 hover:border-blue-400"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="mr-2">📱</span>
                  UseSession → Session Reminder
                  <span className="ml-2">✨</span>
                </a>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h5 className="font-semibold text-amber-800 mb-2">Need your bookmarks bar?</h5>
                    <div className="text-sm text-amber-700 space-y-1">
                      <p><strong>Chrome/Edge:</strong> Press <kbd className="px-2 py-1 bg-amber-200 rounded font-mono">Ctrl+Shift+B</kbd> (Windows) or <kbd className="px-2 py-1 bg-amber-200 rounded font-mono">Cmd+Shift+B</kbd> (Mac)</p>
                      <p><strong>Firefox:</strong> Press <kbd className="px-2 py-1 bg-amber-200 rounded font-mono">Ctrl+Shift+B</kbd> or View → Toolbars → Bookmarks</p>
                      <p><strong>Safari:</strong> Press <kbd className="px-2 py-1 bg-amber-200 rounded font-mono">Cmd+Shift+B</kbd> or View → Show Favorites Bar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-slate-800">🎯 Navigate to UseSession</h3>
                <p className="text-slate-600">Find your client's session details</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-slate-700 text-lg">
                Go to any client's detail page in UseSession where you can see their contact info and session details.
              </p>
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6">
                <h5 className="font-semibold text-slate-800 mb-3">🔍 Look for pages that show:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-slate-700">Client name</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-slate-700">Phone number</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-slate-700">Email address</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-slate-700">Session type</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-slate-700">Session date & time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-slate-800">✨ Click the Magic Bookmark</h3>
                <p className="text-slate-600">Watch the automation work</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-slate-700 text-lg">
                While on the UseSession client page, click the bookmark you added in Step 1.
              </p>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                <h5 className="font-semibold text-emerald-800 mb-3">🎉 What happens next:</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-emerald-700">Bookmark automatically grabs client info</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-emerald-700">New tab opens with Session Reminder form</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-emerald-700">All client details are filled automatically</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span className="text-emerald-700">Confirmation popup shows what was found</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center font-bold text-white text-lg">
                4
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-slate-800">🚀 Send the Reminder</h3>
                <p className="text-slate-600">Review, customize, and send</p>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-slate-700 text-lg">
                Review the auto-filled form, customize the message if needed, and send the SMS reminder.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span className="font-semibold text-blue-800">Check client info</span>
                  </div>
                  <p className="text-sm text-blue-700 ml-8">Verify all details look correct</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="font-semibold text-purple-800">Customize message</span>
                  </div>
                  <p className="text-sm text-purple-700 ml-8">Edit to add personal touch</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="font-semibold text-emerald-800">Confirm opt-in</span>
                  </div>
                  <p className="text-sm text-emerald-700 ml-8">Toggle "opted in" switch ON</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span className="font-semibold text-amber-800">Send reminder</span>
                  </div>
                  <p className="text-sm text-amber-700 ml-8">Click the send button</p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">🔧</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-slate-800">Troubleshooting</h3>
                <p className="text-slate-600">Common issues and quick fixes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                <h5 className="font-semibold text-slate-800 mb-2">🤔 Bookmark didn't grab all info</h5>
                <p className="text-sm text-slate-600">No worries! Just fill in the missing fields manually.</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                <h5 className="font-semibold text-slate-800 mb-2">🖱️ Can't drag the bookmark</h5>
                <p className="text-sm text-slate-600">Right-click the button and select "Add to bookmarks" instead.</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                <h5 className="font-semibold text-slate-800 mb-2">🚫 Nothing happens when clicked</h5>
                <p className="text-sm text-slate-600">Make sure you're on a UseSession client page, not the dashboard.</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4 border border-white/40">
                <h5 className="font-semibold text-slate-800 mb-2">📱 SMS didn't send</h5>
                <p className="text-sm text-slate-600">Check the "opted in" toggle is ON and phone number is correct.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="/"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="mr-3 text-xl">🚀</span>
              <span className="text-lg">Get Started Now</span>
              <span className="ml-3 group-hover:translate-x-1 transition-transform text-lg">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}