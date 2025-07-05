'use client'

import React from 'react'
import SimpleMobile from '@/components/SimpleMobile'

export default function Instructions() {
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
                    href="/extension"
                    className="inline-flex items-center justify-center px-4 py-2 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 text-sm"
                    download="session-reminder-extension.zip"
                  >
                    <span className="mr-2">⬇️</span>
                    Download Extension
                  </a>
                  <span className="text-stone-600 text-xs sm:text-sm self-center text-center sm:text-left">Install once, works everywhere!</span>
                </div>
              </div>

              {/* Simple Mobile/Desktop Solution */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6">
                <h3 className="text-gray-800 font-semibold mb-3 text-sm sm:text-base">🔗 URL Copy Method</h3>
                <p className="text-gray-700 text-xs sm:text-sm mb-4">
                  Works on all devices - just copy and paste the UseSession URL
                </p>
                <SimpleMobile />
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
                    <span className="text-stone-700 text-xs sm:text-sm">Client name (e.g., "Emily Mico")</span>
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

          {/* Troubleshooting */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-stone-100">
            <div className="flex items-start sm:items-center mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg sm:text-xl">🔧</span>
              </div>
              <div className="ml-3 sm:ml-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Troubleshooting</h2>
                <p className="text-sm sm:text-base text-gray-600">Common issues and quick fixes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">🤔 Missing session title</h3>
                <p className="text-xs sm:text-sm text-gray-600">Extension may show "Photography Session" - manually update with the actual session name.</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">📱 SMS not sending</h3>
                <p className="text-xs sm:text-sm text-gray-600">Check opt-in toggle is ON and phone number is correct. Verify TextMagic credentials.</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">🚫 Extension not working</h3>
                <p className="text-xs sm:text-sm text-gray-600">Make sure you're on an individual UseSession session page, not the main dashboard.</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">⏰ Scheduled reminders not sending</h3>
                <p className="text-xs sm:text-sm text-gray-600">Use the manual "Run Cron Job" button in the dashboard to process scheduled messages.</p>
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