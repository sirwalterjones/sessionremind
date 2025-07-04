'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Form from '@/components/Form'

interface FormData {
  name: string
  phone: string
  email: string
  sessionTitle: string
  sessionTime: string
  message: string
  optedIn: boolean
  sendRegistrationMessage: boolean
  threeDayReminder: boolean
  oneDayReminder: boolean
}

export default function NewReminder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<Partial<FormData>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [successDetails, setSuccessDetails] = useState('')
  const [textInput, setTextInput] = useState('')
  const [isExtractingText, setIsExtractingText] = useState(false)
  const [showTextExtractor, setShowTextExtractor] = useState(false)


  const handleSmartExtraction = async () => {
    if (!textInput.trim()) return
    
    setIsExtractingText(true)
    
    try {
      const input = textInput.trim()
      
      // Check if input looks like a URL
      const isUrl = input.startsWith('http://') || input.startsWith('https://') || input.includes('usesession.com')
      
      if (isUrl) {
        // Extract URL and try server-side extraction
        const urlMatch = input.match(/(https?:\/\/[^\s]+)/i)
        if (urlMatch) {
          console.log('🔗 Detected URL, calling server extraction:', urlMatch[0])
          await extractDataFromSharedUrl(urlMatch[0])
        } else {
          throw new Error('Invalid URL format')
        }
      } else {
        // Treat as text and extract locally
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

        // Extract name - try multiple patterns for UseSession format
        let nameMatch = null
        
        // Pattern 1: Name before email (most common)
        nameMatch = input.match(/([A-Z][a-z]+(?:\s+[A-Z]\.?)*(?:\s+[A-Z][a-z]+)+)(?=\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
        
        // Pattern 2: Full name patterns common in UseSession
        if (!nameMatch) {
          nameMatch = input.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b(?=.*@)/)
        }
        
        // Pattern 3: Name at start of lines
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

        // Extract session title - try to infer from context
        let sessionTitle = 'Photography Session'
        
        // Look for seasonal/themed session patterns
        const sessionPatterns = [
          // Seasonal with year
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\s+20\d{2})/gi,
          // Common session types
          /(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\s+[A-Z][a-z]+)*(?:\s+20\d{2})?/gi,
          // Session/shoot patterns
          /([A-Z][a-z\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\s]*)/gi
        ]
        
        for (const pattern of sessionPatterns) {
          const matches = input.match(pattern)
          if (matches && matches[0].length > 5 && matches[0].length < 80) {
            sessionTitle = matches[0].trim()
            break
          }
        }
        
        // If we found a date, create a more descriptive title
        if (extractedData.sessionTime && sessionTitle === 'Photography Session') {
          const monthMatch = extractedData.sessionTime.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i)
          if (monthMatch) {
            sessionTitle = `${monthMatch[1]} Photography Session`
          }
        }
        
        extractedData.sessionTitle = sessionTitle

        // Update form with extracted data
        setInitialData(prev => ({
          ...prev,
          name: extractedData.name || prev.name,
          email: extractedData.email || prev.email,
          phone: extractedData.phone || prev.phone,
          sessionTitle: extractedData.sessionTitle || prev.sessionTitle,
          sessionTime: extractedData.sessionTime || prev.sessionTime
        }))

        console.log('✅ Successfully extracted data from text:', extractedData)
      }
      
      setTextInput('')
      
    } catch (error) {
      console.error('Error extracting data:', error)
    } finally {
      setIsExtractingText(false)
    }
  }

  const extractDataFromSharedUrl = async (url: string) => {
    try {
      console.log('🔄 Processing shared UseSession URL:', url)
      
      // Show loading state
      setInitialData(prev => ({
        ...prev,
        sessionTitle: 'Extracting data from UseSession...'
      }))

      // Call our server-side extraction API
      console.log('📡 Making API call to /api/extract-usesession')
      const response = await fetch('/api/extract-usesession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      console.log('📊 API Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('📋 API Response data:', result)
        
        if (result.success && result.data) {
          // Update form with extracted data
          const newData = {
            name: result.data.name || '',
            email: result.data.email || '',
            phone: result.data.phone || '',
            sessionTitle: result.data.sessionTitle || 'Photography Session',
            sessionTime: result.data.sessionTime || ''
          }
          
          console.log('🎯 Updating form with:', newData)
          
          setInitialData(prev => ({
            ...prev,
            ...newData
          }))
          
          console.log('✅ Successfully extracted and updated form data')
        } else {
          console.log('❌ API call succeeded but no data returned')
          throw new Error('Failed to extract data - no data in response')
        }
      } else {
        const errorText = await response.text()
        console.log('❌ API call failed:', errorText)
        throw new Error(`Server extraction failed: ${response.status}`)
      }
    } catch (error) {
      console.error('💥 Error processing shared URL:', error)
      // Show error in the form
      setInitialData(prev => ({
        ...prev,
        sessionTitle: `❌ Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
    }
  }

  useEffect(() => {
    // Check for PWA share target
    const sharedUrl = searchParams.get('shared_url')
    const url = searchParams.get('url') // Alternative parameter name
    
    console.log('URL params:', Object.fromEntries(searchParams.entries()))
    
    const targetUrl = sharedUrl || url
    if (targetUrl) {
      console.log('Received shared URL:', targetUrl)
      // Show that we received a shared URL
      setInitialData(prev => ({
        ...prev,
        sessionTitle: 'Processing shared URL...'
      }))
      // Extract data from UseSession URL if possible
      extractDataFromSharedUrl(targetUrl)
    }
    
    const params = {
      name: searchParams.get('name') || '',
      phone: searchParams.get('phone') || '',
      email: searchParams.get('email') || '',
      sessionTitle: searchParams.get('sessionTitle') || '',
      sessionTime: searchParams.get('sessionTime') || '',
    }
    setInitialData(params)
  }, [searchParams])

  const handleSubmit = async (formData: FormData) => {
    console.log('=== FORM SUBMIT START ===')
    console.log('Form data:', formData)
    console.log('Opted in:', formData.optedIn)
    console.log('3-Day reminder:', formData.threeDayReminder)
    console.log('1-Day reminder:', formData.oneDayReminder)
    console.log('========================')

    if (!formData.optedIn) {
      setSuccessMessage('Opt-in Required')
      setSuccessDetails('Client must opt in to receive SMS reminders before you can send messages.')
      setShowSuccess(true)
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Send registration confirmation immediately (if enabled)
      let registrationSent = false
      let registrationMessage = ''
      
      if (formData.sendRegistrationMessage) {
        console.log('Sending registration confirmation...')
        
        registrationMessage = `Hi ${formData.name}! You're registered for text reminders from Moments by Candice Photography. Your ${formData.sessionTitle} session is scheduled for ${formData.sessionTime}. Looking forward to seeing you!`

        const smsResponse = await fetch('/api/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            message: registrationMessage,
          }),
        })

        if (!smsResponse.ok) {
          throw new Error('Failed to send registration confirmation')
        }
        
        registrationSent = true
      } else {
        console.log('Skipping registration confirmation (disabled by user)')
      }

      // 2. Schedule reminders if selected
      if (formData.threeDayReminder || formData.oneDayReminder) {
        console.log('Scheduling reminders...')
        
        const scheduleResponse = await fetch('/api/schedule-reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            testMode: false, // Regular scheduling mode
          }),
        })
        
        if (!scheduleResponse.ok) {
          throw new Error('Failed to schedule reminders')
        }

        const scheduleResult = await scheduleResponse.json()
        
        // Store the sent message and scheduled reminders in localStorage for dashboard
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]')
        
        // Add registration message (if sent)
        if (registrationSent) {
          sentMessages.push({
            ...formData,
            message: registrationMessage,
            status: 'Sent (Registration)',
            timestamp: new Date().toISOString(),
            id: Date.now(),
          })
        }

        // Add scheduled reminders
        scheduleResult.scheduledReminders?.forEach((reminder: any) => {
          sentMessages.push({
            ...formData,
            message: formData.message
              .replace(/{name}/g, formData.name)
              .replace(/{sessionTitle}/g, formData.sessionTitle)
              .replace(/{sessionTime}/g, formData.sessionTime),
            status: `Scheduled (${reminder.type})`,
            timestamp: new Date().toISOString(),
            scheduledFor: reminder.scheduledFor,
            id: reminder.id,
          })
        })
        
        localStorage.setItem('sentMessages', JSON.stringify(sentMessages))

        // Create success message with details about scheduled/skipped reminders
        const scheduledCount = scheduleResult.scheduledReminders?.length || 0
        let successDetail = ''
        
        if (registrationSent) {
          successDetail = `${formData.name} has been registered and ${scheduledCount} reminder(s) scheduled.`
        } else {
          successDetail = `${scheduledCount} reminder(s) scheduled for ${formData.name}.`
        }
        
        if (scheduleResult.skippedReminders && scheduleResult.skippedReminders.length > 0) {
          successDetail += ` ${scheduleResult.skippedReminders.join(', ')}.`
        }
        
        if (scheduleResult.daysUntilSession !== undefined) {
          successDetail += ` Session is ${scheduleResult.daysUntilSession} days away.`
        }

        setSuccessMessage(registrationSent ? '✅ Registration & Reminders Scheduled!' : '✅ Reminders Scheduled!')
        setSuccessDetails(successDetail)
        setShowSuccess(true)
      } else {
        // Just registration, no reminders
        if (registrationSent) {
          const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]')
          sentMessages.push({
            ...formData,
            message: registrationMessage,
            status: 'Sent (Registration)',
            timestamp: new Date().toISOString(),
            id: Date.now(),
          })
          localStorage.setItem('sentMessages', JSON.stringify(sentMessages))

          setSuccessMessage('✅ Registration Confirmed!')
          setSuccessDetails(`${formData.name} has been registered and confirmation sent to ${formData.phone}`)
        } else {
          // No registration message, no reminders - just a confirmation
          setSuccessMessage('✅ Setup Complete!')
          setSuccessDetails(`${formData.name} has been set up in the system without any messages sent.`)
        }
        setShowSuccess(true)
      }
    } catch (error) {
      console.error('Error processing request:', error)
      setSuccessMessage('❌ Error')
      setSuccessDetails('Failed to process request. Please check your TextMagic credentials and try again.')
      setShowSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-200 rounded-full mb-6">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Create New Reminder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Send personalized SMS reminders to your photography clients
          </p>
        </div>

        {/* Mobile Data Extraction Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">📱 Extract from UseSession</h3>
            <p className="text-blue-700 text-sm">
              Two easy ways to get your client data
            </p>
          </div>
          
          {/* Method Selection */}
          <div className="grid gap-4 mb-6">
            {/* Mobile Bookmarklet Method */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-2xl">⚡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-2">Method 1: One-Tap Bookmarklet</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Save this link to your bookmarks, then tap it while on any UseSession page
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-2">Drag this to your bookmarks bar (or copy link):</p>
                    <a 
                      href={`javascript:(function(){
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
                          sessionTitle: sessionTime ? sessionTime.includes('July') ? 'July Photography Session' : 'Photography Session' : 'Photography Session'
                        });
                        window.open('${window.location.origin}/new?' + params.toString(), '_blank');
                      })();`}
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      📚 UseSession → Reminder
                    </a>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    ✨ One tap while on UseSession = instant form fill!
                  </p>
                </div>
              </div>
            </div>

            {/* Copy-Paste Method */}
            <div className="bg-white border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-2xl">📋</span>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-2">Method 2: Copy & Paste</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    If bookmarklet doesn't work, copy the UseSession page text and paste below
                  </p>
                  <button
                    onClick={() => setShowTextExtractor(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    📝 Open Text Paste
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Text Extractor (shown when Copy & Paste is clicked) */}
          {showTextExtractor && (
            <div className="bg-white rounded-xl p-6 border border-blue-100">
            <div className="space-y-6">
              {/* Mobile Instructions */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 text-2xl">📱</span>
                  <div>
                    <h4 className="font-bold text-green-900 mb-3">Easy Mobile Steps:</h4>
                    <div className="space-y-2 text-green-800 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <div>On the UseSession page, tap and hold to <strong>Select All</strong></div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <div>Tap <strong>Copy</strong> from the menu</div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                        <div>Come back here and tap <strong>Paste</strong> in the box below</div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                        <div>Tap <strong>"Extract Data"</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Large mobile-friendly input */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  📋 Paste UseSession Text Here:
                </label>
                <textarea
                  placeholder="Tap here and paste all the text from your UseSession page...

Looking for text like:
• Client name (e.g., Melissa Comtois)
• Email (melissaacomtois@gmail.com)  
• Phone (+16035606316)
• Date & time (Sunday, July 13th, 2025, 7:30 PM)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
                {textInput.trim() && (
                  <div className="mt-2 text-sm text-gray-600">
                    ✓ {textInput.length} characters pasted - ready to extract!
                  </div>
                )}
              </div>

              {/* Large mobile-friendly button */}
              <button
                onClick={handleSmartExtraction}
                disabled={!textInput.trim() || isExtractingText}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {isExtractingText ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Extracting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>Extract Client Data</span>
                  </div>
                )}
              </button>

              {textInput && (
                <button
                  onClick={() => setTextInput('')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear & Start Over
                </button>
              )}
            </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <Form
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-stone-200 rounded-full flex items-center justify-center">
                  <span className="text-3xl">
                    {successMessage.includes('❌') ? '⚠️' : 
                     successMessage.includes('Opt-in') ? '📋' : '🎉'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {successMessage}
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {successDetails}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowSuccess(false)
                      if (successMessage.includes('🎉') || successMessage.includes('✅')) {
                        router.push('/dashboard')
                      }
                    }}
                    className="px-6 py-3 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-900 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {successMessage.includes('🎉') || successMessage.includes('✅') ? 'View Dashboard' : 'Got it'}
                  </button>
                  
                  {(successMessage.includes('🎉') || successMessage.includes('✅')) && (
                    <button
                      onClick={() => {
                        setShowSuccess(false)
                        // Reset form for another reminder
                        window.location.reload()
                      }}
                      className="px-6 py-3 bg-white border border-stone-200 text-gray-700 font-medium rounded-full hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
                    >
                      Send Another
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}