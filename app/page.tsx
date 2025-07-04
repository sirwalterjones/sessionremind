'use client'

import React from 'react'

export default function Home() {
  const simpleBookmarkletCode = "javascript:window.open('https://sessionremind.com/new','_blank');"
  
  const dataExtractionBookmarkletCode = "javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\\n').map(l=>l.trim()).filter(l=>l.length>0);if(window.location.href.includes('app.usesession.com/sessions/')){const nameMatch=allText.match(/([A-Z][a-z]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][a-z]+)*\\s+[A-Z][a-z]+)(?=\\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/);if(nameMatch){n=nameMatch[1];}const timeMatch=allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);const dayMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);if(timeMatch && dayMatch){t=dayMatch[1]+', '+dayMatch[2]+' at '+timeMatch[1];}else if(dayMatch){t=dayMatch[1]+', '+dayMatch[2];}let sessionTitle='';const titleSelectors=['h1','h2','h3','[class*=\"title\"]','[class*=\"session\"]','[class*=\"booking\"]'];for(const sel of titleSelectors){const els=document.querySelectorAll(sel);for(const el of els){const txt=el.textContent.trim();if(txt && txt.length>10 && txt.length<100 && !txt.match(/^[0-9]/) && !txt.includes('@') && !txt.includes('$') && !txt.toLowerCase().includes('earnings') && !txt.toLowerCase().includes('bookings') && !txt.toLowerCase().includes('views') && !txt.toLowerCase().includes('waitlist') && !txt.toLowerCase().includes('balance') && (txt.match(/\\b20\\d{2}\\b/) || txt.toLowerCase().includes('field') || txt.toLowerCase().includes('summer') || txt.toLowerCase().includes('winter') || txt.toLowerCase().includes('spring') || txt.toLowerCase().includes('fall') || txt.toLowerCase().includes('christmas') || txt.toLowerCase().includes('holiday') || txt.toLowerCase().includes('watermelon') || txt.toLowerCase().includes('sunflower') || txt.toLowerCase().includes('pumpkin') || txt.toLowerCase().includes('beach') || txt.toLowerCase().includes('studio') || txt.toLowerCase().includes('session') || txt.toLowerCase().includes('shoot') || txt.toLowerCase().includes('mini') || txt.toLowerCase().includes('portrait') || txt.toLowerCase().includes('photo'))){sessionTitle=txt;break;}}if(sessionTitle)break;}if(!sessionTitle){const patterns=[/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\\s+20\\d{2})/gi,/(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\\s+[A-Z][a-z]+)*(?:\\s+20\\d{2})?/gi,/([A-Z][a-z\\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\\s]*)/gi,/(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi,/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s+(?:Mini|Session|Shoot|Portrait|Photo)/gi];for(const pattern of patterns){const matches=allText.match(pattern);if(matches && matches[0].length>5 && matches[0].length<80){sessionTitle=matches[0].trim();break;}}}s=sessionTitle||'Photography Session';}else{for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][a-z]+)*\\s+[A-Z][a-z]+$/gm);if(names){n=names[0];}}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new?'+params.toString(),'_blank');}catch(err){const baseUrl='https://sessionremind.com';window.open(baseUrl+'/new','_blank');}})();"
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-200 rounded-full mb-8">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Never Miss a Session Again
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Automatically send SMS reminders to your photography clients with just one click from UseSession
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/new"
              className="inline-flex items-center px-8 py-4 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-lg"
            >
              <span className="mr-3">✨</span>
              Create Reminder
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 shadow-sm text-lg"
            >
              <span className="mr-3">📊</span>
              View Dashboard
            </a>
          </div>
        </div>

        {/* Integration Methods */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Choose Your Integration</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extract client data from UseSession automatically with either option
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          
          {/* Browser Extension */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <span className="text-emerald-600 text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Browser Extension</h3>
              <p className="text-gray-600">
                Premium experience with seamless integration
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-6">
              <h4 className="text-emerald-800 font-medium mb-3">✨ Best User Experience</h4>
              <ul className="text-emerald-700 text-sm space-y-2 mb-4">
                <li>• Floating button appears automatically</li>
                <li>• Works on all UseSession pages</li>
                <li>• No bookmarks needed</li>
                <li>• One-click data extraction</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="/extension"
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition-all duration-200"
                  download="session-reminder-extension-improved-names.zip"
                >
                  <span className="mr-2">⬇️</span>
                  Download Extension
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
- A floating "Send Text Reminder" button on UseSession pages
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
                  className="inline-flex items-center justify-center px-6 py-3 bg-white border border-stone-200 text-stone-700 font-medium rounded-full hover:bg-stone-50 transition-all duration-200"
                >
                  <span className="mr-2">📖</span>
                  Install Guide
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">1</div>
                <p className="text-xs text-stone-600">Download</p>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-stone-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">2</div>
                <p className="text-xs text-stone-600">Install</p>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-stone-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">3</div>
                <p className="text-xs text-stone-600">Visit UseSession</p>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">4</div>
                <p className="text-xs text-stone-600">Click Button</p>
              </div>
            </div>
          </div>

          {/* Bookmarklet */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-6">
                <span className="text-stone-600 text-2xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Bookmarklet</h3>
              <p className="text-gray-600">
                Quick start - works instantly with any browser
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-6">
              <h4 className="text-stone-800 font-medium mb-3">🔗 Quick Start</h4>
              <p className="text-stone-700 text-sm mb-4">
                Drag this button to your bookmarks bar and click it on any UseSession page
              </p>
              <div className="text-center">
                <a 
                  href={dataExtractionBookmarkletCode}
                  className="inline-flex items-center px-6 py-3 bg-stone-700 text-white font-medium rounded-full hover:bg-stone-800 transition-all duration-200 cursor-move no-underline"
                  draggable="true"
                  title="Drag this to your bookmarks bar"
                >
                  <span className="mr-2">📱</span>
                  UseSession → Session Reminder
                  <span className="ml-2">✨</span>
                </a>
              </div>
              <p className="text-center text-xs text-stone-600 mt-2">
                👆 Drag this button to your bookmarks bar (don't click it)
              </p>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 font-medium text-sm mb-2">Can't drag? Manual setup:</p>
                <ol className="text-amber-700 text-xs space-y-1">
                  <li>1. Right-click the button above → "Copy link"</li>
                  <li>2. Add new bookmark in your browser</li>
                  <li>3. Paste the copied link as the URL</li>
                  <li>4. Name it "Session Reminder"</li>
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">1</div>
                <p className="text-xs text-stone-600">Drag to Bookmarks</p>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-stone-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">2</div>
                <p className="text-xs text-stone-600">Visit UseSession</p>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-xl">
                <div className="w-8 h-8 bg-stone-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">3</div>
                <p className="text-xs text-stone-600">Click & Done!</p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <span className="text-stone-600 text-lg">💡</span>
                <div>
                  <p className="text-stone-800 font-medium text-sm mb-1">Show bookmarks bar:</p>
                  <p className="text-stone-700 text-xs">
                    <kbd className="px-2 py-1 bg-stone-200 rounded text-xs font-mono">Ctrl+Shift+B</kbd> (Windows) or 
                    <kbd className="px-2 py-1 bg-stone-200 rounded text-xs font-mono ml-1">Cmd+Shift+B</kbd> (Mac)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-6">
                <span className="text-stone-600 text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Extract Data</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically captures client name, phone, email, session type, and date from UseSession pages
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-6">
                <span className="text-stone-600 text-2xl">✏️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customize Message</h3>
              <p className="text-gray-600 leading-relaxed">
                Personalize your SMS reminder with client name, session details, and your custom message
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <span className="text-emerald-600 text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Send & Schedule</h3>
              <p className="text-gray-600 leading-relaxed">
                Send immediately or schedule automatic reminders 3 days and 1 day before the session
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Never Miss Another Session?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start sending professional SMS reminders to your photography clients today
          </p>
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
  )
}