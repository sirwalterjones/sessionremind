'use client'

import React from 'react'

export default function Home() {
  const simpleBookmarkletCode = "javascript:window.open('https://sessionremind.com/new','_blank');"
  
  const dataExtractionBookmarkletCode = "javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\\n').map(l=>l.trim()).filter(l=>l.length>0);if(window.location.href.includes('app.usesession.com/sessions/')){const nameMatch=allText.match(/([A-Z][a-z]+ [A-Z][a-z]+)(?=\\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/);if(nameMatch){n=nameMatch[1];}const timeMatch=allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);const dayMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);if(timeMatch && dayMatch){t=dayMatch[1]+', '+dayMatch[2]+' at '+timeMatch[1];}else if(dayMatch){t=dayMatch[1]+', '+dayMatch[2];}let sessionTitle='';const titleSelectors=['h1','h2','h3','[class*=\"title\"]','[class*=\"session\"]'];for(const sel of titleSelectors){const els=document.querySelectorAll(sel);for(const el of els){const txt=el.textContent.trim();if(txt && txt.length>5 && txt.length<100 && !txt.match(/^[0-9]/) && !txt.includes('@') && !txt.includes('$') && (txt.toLowerCase().includes('session')||txt.toLowerCase().includes('shoot')||txt.toLowerCase().includes('mini')||txt.toLowerCase().includes('portrait')||txt.toLowerCase().includes('photo'))){sessionTitle=txt;break;}}if(sessionTitle)break;}if(!sessionTitle){const patterns=[/([A-Z][a-z\\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\\s]*)/gi,/(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi];for(const pattern of patterns){const matches=allText.match(pattern);if(matches && matches[0].length>5 && matches[0].length<80){sessionTitle=matches[0].trim();break;}}}s=sessionTitle||'Photography Session';}else{for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/gm);if(names){n=names[0];}}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new?'+params.toString(),'_blank');}catch(err){const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new','_blank');}})();"
  
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="relative">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Never Miss a Session Again
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Automatically send SMS reminders to your photography clients with just one click from UseSession
          </p>
        </div>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/instructions"
            className="group inline-flex items-center px-8 py-4 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">📖</span>
            Quick Start Guide
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a
            href="/new"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">✨</span>
            Create Reminder
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a
            href="/dashboard"
            className="group inline-flex items-center px-8 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">📊</span>
            View Dashboard
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
      
      {/* Choose Your Method */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Integration Method</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Extract client data from UseSession automatically with either a browser extension or bookmarklet
        </p>
      </div>

      {/* Browser Extension Option */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Browser Extension</h3>
          <p className="text-slate-600 max-w-lg mx-auto">
            The premium experience - seamless integration with floating action button
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <h4 className="text-white font-semibold mb-2">✨ Best User Experience</h4>
            <p className="text-emerald-100 text-sm mb-4">Install once, works everywhere on UseSession</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="/extension"
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30 hover:border-white/50"
                download="session-reminder-extension.zip"
              >
                <span className="mr-2">⬇️</span>
                Download Extension
                <span className="ml-2">✨</span>
              </a>
              <button 
                onClick={() => {
                  const readme = `# Session Reminder Extension Installation

## Quick Installation Steps:

1. **Download the extension** (click the download button)
2. **Extract the ZIP file** to a folder on your computer
3. **Open Chrome** and go to chrome://extensions/
4. **Enable Developer Mode** (toggle switch in top right)
5. **Click "Load unpacked"** and select the extracted folder
6. **Done!** Visit any UseSession page to see the floating button

## What You'll See:
- A floating "Send Reminder" button on UseSession pages
- Click it to automatically extract client data
- New tab opens with reminder form pre-filled

## Browser Support:
✅ Chrome, Edge, Brave, and other Chromium browsers`;
                  
                  const blob = new Blob([readme], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'installation-guide.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <span className="mr-2">📖</span>
                Installation Guide
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">1</div>
            <h5 className="font-semibold text-slate-800 mb-1">Download</h5>
            <p className="text-sm text-slate-600">Get the extension file</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">2</div>
            <h5 className="font-semibold text-slate-800 mb-1">Install</h5>
            <p className="text-sm text-slate-600">Load in Chrome extensions</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">3</div>
            <h5 className="font-semibold text-slate-800 mb-1">Visit UseSession</h5>
            <p className="text-sm text-slate-600">Go to any session page</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-orange-50 border border-orange-200">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">4</div>
            <h5 className="font-semibold text-slate-800 mb-1">Click Button</h5>
            <p className="text-sm text-slate-600">Use floating action button</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⭐</span>
            <div>
              <h5 className="font-semibold text-emerald-800 mb-1">Why choose the extension?</h5>
              <p className="text-sm text-emerald-700">
                Floating button appears automatically on UseSession pages • No bookmarks needed • Better user experience • Works on mobile browsers too
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarklet Option */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Bookmarklet</h3>
          <p className="text-slate-600 max-w-lg mx-auto">
            Quick start option - works instantly with any browser
          </p>
        </div>

        {/* Main Bookmarklet */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <h4 className="text-white font-semibold mb-2">🔗 Quick Start Bookmarklet</h4>
            <p className="text-blue-100 text-sm mb-4">Drag this to your bookmarks bar - works immediately!</p>
            <a 
              href={dataExtractionBookmarkletCode}
              className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 cursor-move border border-white/30 hover:border-white/50"
              onClick={(e) => e.preventDefault()}
            >
              <span className="mr-2">📱</span>
              UseSession → Session Reminder
              <span className="ml-2">✨</span>
            </a>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">1</div>
            <h5 className="font-semibold text-slate-800 mb-1">Drag to Bookmarks</h5>
            <p className="text-sm text-slate-600">Add the magic button to your browser</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">2</div>
            <h5 className="font-semibold text-slate-800 mb-1">Visit UseSession</h5>
            <p className="text-sm text-slate-600">Go to any client session page</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 font-bold">3</div>
            <h5 className="font-semibold text-slate-800 mb-1">Click & Done!</h5>
            <p className="text-sm text-slate-600">Form opens with everything filled</p>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h5 className="font-semibold text-amber-800 mb-1">Need your bookmarks bar?</h5>
              <p className="text-sm text-amber-700">
                Press <kbd className="px-2 py-1 bg-amber-200 rounded text-xs font-mono">Ctrl+Shift+B</kbd> (Windows) or 
                <kbd className="px-2 py-1 bg-amber-200 rounded text-xs font-mono ml-1">Cmd+Shift+B</kbd> (Mac)
              </p>
            </div>
          </div>
        </div>

        {/* Testing */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-slate-500 mb-2">For testing:</p>
          <a 
            href={simpleBookmarkletCode}
            className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors cursor-move border border-slate-200"
            onClick={(e) => e.preventDefault()}
          >
            <span className="mr-2">📝</span>
            Test Form (No Data)
          </a>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h5 className="font-semibold text-blue-800 mb-2">How to Test the Magic Bookmarklet:</h5>
            <ol className="text-sm text-blue-700 text-left max-w-md mx-auto space-y-1">
              <li>1. Drag the bookmarklet above to your bookmarks bar</li>
              <li>2. Go to any UseSession page (calendar or individual booking)</li>
              <li>3. Click the bookmarklet in your bookmarks bar</li>
              <li>4. Watch it automatically extract and fill client data!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}