'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Form from '@/components/Form'
import MobileManualEntry from '@/components/MobileManualEntry'

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
  sendManualText: boolean
  manualMessage: string
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
      
      if (formData.sendRegistrationMessage && !formData.sendManualText) {
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

      // 2. Send manual text immediately (if enabled)
      let manualTextSent = false
      let finalManualMessage = ''
      
      if (formData.sendManualText) {
        console.log('Sending manual text...')
        
        // Replace placeholders in manual message
        finalManualMessage = formData.manualMessage
          .replace(/{name}/g, formData.name)
          .replace(/{sessionTitle}/g, formData.sessionTitle)
          .replace(/{sessionTime}/g, formData.sessionTime)

        const manualSmsResponse = await fetch('/api/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            message: finalManualMessage,
          }),
        })

        if (!manualSmsResponse.ok) {
          throw new Error('Failed to send manual text')
        }
        
        manualTextSent = true
      } else {
        console.log('Skipping manual text (disabled by user)')
      }

      // 3. Schedule reminders if selected (but not if manual text was sent)
      if ((formData.threeDayReminder || formData.oneDayReminder) && !manualTextSent) {
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

        // Add manual text message (if sent)
        if (manualTextSent) {
          sentMessages.push({
            ...formData,
            message: finalManualMessage,
            status: 'Sent (Manual)',
            timestamp: new Date().toISOString(),
            id: Date.now() + 1, // Ensure unique ID
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

        // Create success message with details about sent messages and scheduled reminders
        const scheduledCount = scheduleResult.scheduledReminders?.length || 0
        let successDetail = ''
        let sentCount = 0
        let sentTypes = []
        
        if (registrationSent) {
          sentCount++
          sentTypes.push('registration')
        }
        if (manualTextSent) {
          sentCount++
          sentTypes.push('manual text')
        }
        
        if (sentCount > 0) {
          successDetail = `${sentCount} message(s) sent (${sentTypes.join(', ')}) to ${formData.name}.`
        }
        
        if (scheduledCount > 0) {
          if (successDetail) successDetail += ` `
          successDetail += `${scheduledCount} reminder(s) scheduled.`
        }
        
        if (scheduleResult.skippedReminders && scheduleResult.skippedReminders.length > 0) {
          successDetail += ` ${scheduleResult.skippedReminders.join(', ')}.`
        }
        
        if (scheduleResult.daysUntilSession !== undefined) {
          successDetail += ` Session is ${scheduleResult.daysUntilSession} days away.`
        }

        // Add note if manual text disabled other services
        if (manualTextSent && (formData.sendRegistrationMessage || formData.threeDayReminder || formData.oneDayReminder)) {
          successDetail += ` Note: Registration and scheduled reminders were automatically disabled since a manual text was sent.`
        }

        // Set appropriate success message
        let successMsg = '✅ '
        if (sentCount > 0 && scheduledCount > 0) {
          successMsg += 'Messages Sent & Reminders Scheduled!'
        } else if (sentCount > 0) {
          successMsg += 'Messages Sent!'
        } else {
          successMsg += 'Reminders Scheduled!'
        }
        
        setSuccessMessage(successMsg)
        setSuccessDetails(successDetail)
        setShowSuccess(true)
      } else {
        // No scheduled reminders, but may have registration or manual text
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]')
        let sentCount = 0
        let sentTypes = []
        
        // Add registration message (if sent)
        if (registrationSent) {
          sentMessages.push({
            ...formData,
            message: registrationMessage,
            status: 'Sent (Registration)',
            timestamp: new Date().toISOString(),
            id: Date.now(),
          })
          sentCount++
          sentTypes.push('registration')
        }

        // Add manual text message (if sent)
        if (manualTextSent) {
          sentMessages.push({
            ...formData,
            message: finalManualMessage,
            status: 'Sent (Manual)',
            timestamp: new Date().toISOString(),
            id: Date.now() + 1,
          })
          sentCount++
          sentTypes.push('manual text')
        }
        
        localStorage.setItem('sentMessages', JSON.stringify(sentMessages))

        if (sentCount > 0) {
          let details = `${sentCount} message(s) sent (${sentTypes.join(', ')}) to ${formData.name}`
          
          // Add note if manual text disabled other services
          if (manualTextSent && (formData.sendRegistrationMessage || formData.threeDayReminder || formData.oneDayReminder)) {
            details += `. Note: Registration and scheduled reminders were automatically disabled since a manual text was sent.`
          }
          
          setSuccessMessage('✅ Messages Sent!')
          setSuccessDetails(details)
        } else {
          // No messages sent at all
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