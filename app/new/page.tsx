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
  const [showUrlExtractor, setShowUrlExtractor] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)

  const handleManualUrlExtraction = async () => {
    if (!urlInput.trim()) return
    
    setIsExtracting(true)
    await extractDataFromSharedUrl(urlInput)
    setIsExtracting(false)
    setShowUrlExtractor(false)
    setUrlInput('')
  }

  const extractDataFromSharedUrl = async (url: string) => {
    try {
      console.log('Processing shared UseSession URL:', url)
      
      // Show loading state
      setInitialData(prev => ({
        ...prev,
        sessionTitle: 'Extracting data from UseSession...'
      }))

      // Call our server-side extraction API
      const response = await fetch('/api/extract-usesession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Update form with extracted data
          setInitialData(prev => ({
            ...prev,
            name: result.data.name || prev.name,
            email: result.data.email || prev.email,
            phone: result.data.phone || prev.phone,
            sessionTitle: result.data.sessionTitle || prev.sessionTitle,
            sessionTime: result.data.sessionTime || prev.sessionTime
          }))
          
          console.log('✅ Successfully extracted data:', result.data)
        } else {
          throw new Error('Failed to extract data')
        }
      } else {
        throw new Error('Server extraction failed')
      }
    } catch (error) {
      console.error('Error processing shared URL:', error)
      // Fallback to manual entry
      setInitialData(prev => ({
        ...prev,
        sessionTitle: 'Manual entry required - extraction failed'
      }))
    }
  }

  useEffect(() => {
    // Check for PWA share target
    const sharedUrl = searchParams.get('shared_url')
    if (sharedUrl) {
      console.log('Received shared URL:', sharedUrl)
      // Extract data from UseSession URL if possible
      extractDataFromSharedUrl(sharedUrl)
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

        {/* URL Extractor Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">🔗 Extract from UseSession</h3>
              <p className="text-blue-700 text-sm">Paste a UseSession URL to auto-fill client data</p>
            </div>
            <button
              onClick={() => setShowUrlExtractor(!showUrlExtractor)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {showUrlExtractor ? 'Hide' : 'Extract Data'}
            </button>
          </div>
          
          {showUrlExtractor && (
            <div className="space-y-4">
              <div>
                <input
                  type="url"
                  placeholder="Paste UseSession URL here (e.g., https://app.usesession.com/sessions/...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleManualUrlExtraction}
                  disabled={!urlInput.trim() || isExtracting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isExtracting ? 'Extracting...' : 'Extract Data'}
                </button>
                <button
                  onClick={() => {
                    setShowUrlExtractor(false)
                    setUrlInput('')
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
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