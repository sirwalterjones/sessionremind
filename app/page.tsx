'use client'

import React, { useState } from 'react'
import MobileManualEntry from '@/components/MobileManualEntry'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'

export default function Home() {
  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false)
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false)

  // Simple test bookmarklet
  const simpleTestBookmarklet = "javascript:alert('Session Remind Test!');"

  const dataExtractionBookmarkletCode = "javascript:(function(){try{const allText=document.body.innerText;let n='',e='',p='',s='',t='';const emails=allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);if(emails){e=emails[0];}const phones=allText.match(/[+]?[0-9]{10,15}/g);if(phones){p=phones[0];}const lines=allText.split('\\n').map(l=>l.trim()).filter(l=>l.length>0);if(window.location.href.includes('app.usesession.com/sessions/')){const nameMatch=allText.match(/([A-Z][a-z]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][a-z]+)*\\s+[A-Z][a-z]+)(?=\\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/);if(nameMatch){n=nameMatch[1];}const timeMatch=allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);const dayMatch=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);if(timeMatch && dayMatch){t=dayMatch[1]+', '+dayMatch[2]+' at '+timeMatch[1];}else if(dayMatch){t=dayMatch[1]+', '+dayMatch[2];}let sessionTitle='';const titleSelectors=['h1','h2','h3','[class*=\"title\"]','[class*=\"session\"]','[class*=\"booking\"]'];for(const sel of titleSelectors){const els=document.querySelectorAll(sel);for(const el of els){const txt=el.textContent.trim();if(txt && txt.length>10 && txt.length<100 && !txt.match(/^[0-9]/) && !txt.includes('@') && !txt.includes('$') && !txt.toLowerCase().includes('earnings') && !txt.toLowerCase().includes('bookings') && !txt.toLowerCase().includes('views') && !txt.toLowerCase().includes('waitlist') && !txt.toLowerCase().includes('balance') && (txt.match(/\\b20\\d{2}\\b/) || txt.toLowerCase().includes('field') || txt.toLowerCase().includes('summer') || txt.toLowerCase().includes('winter') || txt.toLowerCase().includes('spring') || txt.toLowerCase().includes('fall') || txt.toLowerCase().includes('christmas') || txt.toLowerCase().includes('holiday') || txt.toLowerCase().includes('watermelon') || txt.toLowerCase().includes('sunflower') || txt.toLowerCase().includes('pumpkin') || txt.toLowerCase().includes('beach') || txt.toLowerCase().includes('studio') || txt.toLowerCase().includes('session') || txt.toLowerCase().includes('shoot') || txt.toLowerCase().includes('mini') || txt.toLowerCase().includes('portrait') || txt.toLowerCase().includes('photo'))){sessionTitle=txt;break;}}if(sessionTitle)break;}if(!sessionTitle){const sessionPatterns=[/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\\s+20\\d{2})/gi,/(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\\s+[A-Z][a-z]+)*(?:\\s+20\\d{2})?/gi,/([A-Z][a-z\\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\\s]*)/gi,/(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi,/([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s+(?:Mini|Session|Shoot|Portrait|Photo)/gi];for(const pattern of sessionPatterns){const matches=allText.match(pattern);if(matches && matches[0].length>5 && matches[0].length<80){sessionTitle=matches[0].trim();break;}}}if(sessionTitle){s=sessionTitle;}else{s='Photography Session';}}else{for(let i=0;i<lines.length;i++){const line=lines[i];if(line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();const parts=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);s=parts[0].trim();if(s.endsWith(' at')){s=s.replace(/ at$/,'');}break;}else if(line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)){const cleanLine=line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g,'').trim();s=cleanLine.split(/\\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();break;}}const dates=allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(dates){t=dates[0];}else{const altDates=allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi);if(altDates){t=altDates[0];}}const names=allText.match(/^[A-Z][a-z]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][a-z]+)*\\s+[A-Z][a-z]+$/gm);if(names){n=names[0];}}const params=new URLSearchParams();if(n)params.set('name',n);if(e)params.set('email',e);if(p)params.set('phone',p);if(s)params.set('sessionTitle',s);if(t)params.set('sessionTime',t);const baseUrl=window.location.hostname==='localhost'?'http://localhost:3000':'https://sessionremind.vercel.app';const targetUrl=`${baseUrl}/new?${params.toString()}`;console.log('Extracted:',{name:n,email:e,phone:p,sessionTitle:s,sessionTime:t});console.log('URL:',targetUrl);window.open(targetUrl,'_blank');alert(`✅ Session data extracted!\\n\\n📝 Name: ${n||'Not found'}\\n📞 Phone: ${p||'Not found'}\\n📧 Email: ${e||'Not found'}\\n📸 Session: ${s||'Not found'}\\n⏰ Time: ${t||'Not found'}\\n\\nThe Session Reminder form is now open in a new tab.`);}catch(err){console.error('Bookmarklet error:',err);alert('❌ Error extracting data. Please try again or use manual entry.');}})()"
  
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
            
            {/* Browser Extension */}
            <div className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Browser Extension</h3>
                <p className="text-gray-600 text-sm">
                  Premium experience with seamless integration
                </p>
              </div>

              <div className="space-y-3 mb-8 text-sm text-gray-600">
                <div>Floating button appears automatically</div>
                <div>Works on all UseSession pages</div>
                <div>No bookmarks needed</div>
                <div>One-click data extraction</div>
                <div>Resizable button to avoid page conflicts</div>
              </div>

              <div className="space-y-3">
                <a 
                  href="/extension-resizable.zip"
                  className="block text-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200"
                  download="session-reminder-extension-resizable.zip"
                >
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
- Click the main button to automatically extract client data
- Click the small arrow button (⬇️/⬆️) to minimize/expand the button
- Your size preference is remembered across page visits
- New tab opens with reminder form pre-filled

## New Features:
✨ **Resizable Button**: Click the arrow to minimize button to avoid hiding other page elements
✨ **Memory**: Your button size preference is saved automatically
✨ **Mobile Optimized**: Smaller sizes on mobile devices

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
                  className="block text-center px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                >
                  Installation Help
                </button>
              </div>
            </div>

            {/* Bookmarklet */}
            <div className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="mb-6">
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
                <div>Perfect for occasional use</div>
              </div>

              <div className="space-y-4">
                {/* Simple Test Bookmarklet */}
                <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm">🧪 Test Bookmarklet (Simple)</h4>
                  <div 
                    title="Session Remind Test"
                    data-bookmark-title="Session Remind Test"
                    data-bookmarklet={simpleTestBookmarklet}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors duration-200 cursor-move"
                    draggable="true"
                    onClick={(e) => {
                      e.preventDefault();
                      // Show copy instructions instead
                      navigator.clipboard.writeText(simpleTestBookmarklet).then(() => {
                        alert('✅ Test bookmarklet copied!\n\nTo install:\n1. Create a new bookmark\n2. Name it "Session Remind Test"\n3. Paste the copied code as the URL\n4. Save and test!');
                      }).catch(() => {
                        alert('Please manually copy this code:\n\n' + simpleTestBookmarklet);
                      });
                    }}
                    onDragStart={(e) => {
                      // Create a temporary link element with proper bookmark data
                      const tempLink = document.createElement('a');
                      tempLink.href = simpleTestBookmarklet;
                      tempLink.textContent = 'Session Remind Test';
                      tempLink.title = 'Session Remind Test';
                      
                      // Set comprehensive drag data with proper bookmark format
                      e.dataTransfer.setData('text/uri-list', simpleTestBookmarklet);
                      e.dataTransfer.setData('text/plain', simpleTestBookmarklet);
                      e.dataTransfer.setData('text/x-moz-url', `${simpleTestBookmarklet}\nSession Remind Test`);
                      e.dataTransfer.setData('text/html', `<a href="${simpleTestBookmarklet}">Session Remind Test</a>`);
                      e.dataTransfer.setData('application/x-moz-file', '');
                      e.dataTransfer.setData('text/x-moz-place', JSON.stringify({
                        type: 'text/x-moz-place',
                        title: 'Session Remind Test',
                        uri: simpleTestBookmarklet
                      }));
                      
                      // Try to set the drag image to the temp link
                      e.dataTransfer.setDragImage(tempLink, 0, 0);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                                      >
                      🧪 Session Remind Test
                    </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Try dragging this simple test first
                  </p>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <h4 className="font-medium text-gray-900 mb-4">Drag to Bookmarks Bar</h4>
                  <div 
                    title="Session Remind"
                    data-bookmark-title="Session Remind"
                    data-bookmarklet={dataExtractionBookmarkletCode}
                    className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors duration-200 cursor-move"
                    draggable="true"
                    onClick={(e) => {
                      e.preventDefault();
                      // Show copy instructions instead
                      navigator.clipboard.writeText(dataExtractionBookmarkletCode).then(() => {
                        alert('✅ Bookmarklet copied!\n\nTo install:\n1. Create a new bookmark\n2. Name it "Session Remind"\n3. Paste the copied code as the URL\n4. Save and use on UseSession pages!');
                      }).catch(() => {
                        alert('Please manually copy this code and save as a bookmark named "Session Remind":\n\n' + dataExtractionBookmarkletCode);
                      });
                    }}
                    onDragStart={(e) => {
                      // Create a temporary link element with proper bookmark data
                      const tempLink = document.createElement('a');
                      tempLink.href = dataExtractionBookmarkletCode;
                      tempLink.textContent = 'Session Remind';
                      tempLink.title = 'Session Remind';
                      
                      // Set comprehensive drag data with proper bookmark format
                      e.dataTransfer.setData('text/uri-list', dataExtractionBookmarkletCode);
                      e.dataTransfer.setData('text/plain', dataExtractionBookmarkletCode);
                      e.dataTransfer.setData('text/x-moz-url', `${dataExtractionBookmarkletCode}\nSession Remind`);
                      e.dataTransfer.setData('text/html', `<a href="${dataExtractionBookmarkletCode}">Session Remind</a>`);
                      e.dataTransfer.setData('application/x-moz-file', '');
                      e.dataTransfer.setData('text/x-moz-place', JSON.stringify({
                        type: 'text/x-moz-place',
                        title: 'Session Remind',
                        uri: dataExtractionBookmarkletCode
                      }));
                      
                      // Try to set the drag image to the temp link
                      e.dataTransfer.setDragImage(tempLink, 0, 0);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                                      >
                      <div className="w-5 h-5 bg-white rounded flex items-center justify-center mr-2">
                        <span className="text-black text-xs font-bold">S</span>
                      </div>
                      Session Remind
                    </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Drag this button to your bookmarks bar
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => {
                      const bookmarkUrl = dataExtractionBookmarkletCode;
                      
                      if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
                        // For Chrome/Edge - copy to clipboard and show modal
                        navigator.clipboard.writeText(bookmarkUrl).then(() => {
                          setBookmarkletCopied(true);
                          setShowBookmarkletModal(true);
                        });
                      } else {
                        // For other browsers - show modal without copying
                        setBookmarkletCopied(false);
                        setShowBookmarkletModal(true);
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors duration-200"
                  >
                    Installation Help
                  </button>
                </div>
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

      {/* CTA Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6">
            Ready to never miss another session?
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light max-w-2xl mx-auto">
            Start sending professional SMS reminders to your photography clients today
          </p>
          <a
            href="/new"
            className="inline-block px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Get Started Now
          </a>
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