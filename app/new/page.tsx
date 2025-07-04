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

  useEffect(() => {
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