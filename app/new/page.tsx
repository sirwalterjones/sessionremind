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
  schedulingEnabled: boolean
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
    console.log('Scheduling enabled:', formData.schedulingEnabled)
    console.log('========================')

    if (!formData.optedIn) {
      setSuccessMessage('Opt-in Required')
      setSuccessDetails('Client must opt in to receive SMS reminders before you can send messages.')
      setShowSuccess(true)
      return
    }

    setIsSubmitting(true)
    try {
      if (formData.schedulingEnabled) {
        // First, send immediate enrollment confirmation
        console.log('Sending enrollment confirmation SMS...')
        const enrollmentMessage = `✅ Your number has been successfully enrolled in text alerts for your Moments by Candice - Photography session. You'll receive reminders 3 days and 1 day before your ${formData.sessionTitle} session on ${formData.sessionTime}.`
        
        const enrollmentResponse = await fetch('/api/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            message: enrollmentMessage,
          }),
        })

        console.log('Enrollment SMS response:', enrollmentResponse.status)

        // Then schedule automatic reminders
        console.log('Making request to /api/schedule-reminders...')
        console.log('Request body:', JSON.stringify(formData, null, 2))
        
        const response = await fetch('/api/schedule-reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (!response.ok) {
          throw new Error('Failed to schedule reminders')
        }

        const result = await response.json()
        
        // Store the scheduled reminders in localStorage for dashboard
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]')
        
        // Add the enrollment message
        sentMessages.push({
          ...formData,
          message: enrollmentMessage,
          status: 'Sent (Enrollment)',
          timestamp: new Date().toISOString(),
          id: `enrollment_${Date.now()}`,
        })
        
        // Add the scheduled reminders
        result.scheduledReminders.forEach((reminder: any) => {
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

        const enrollmentStatus = enrollmentResponse.ok ? 'Enrollment confirmation sent successfully!' : 'Enrollment confirmation failed'
        setSuccessMessage('🎉 Reminders Scheduled!')
        setSuccessDetails(`${result.scheduledReminders.length} reminder(s) scheduled for ${formData.name}. ${enrollmentStatus}`)
        setShowSuccess(true)
      } else {
        // Send immediate SMS
        const personalizedMessage = formData.message
          .replace(/{name}/g, formData.name)
          .replace(/{sessionTitle}/g, formData.sessionTitle)
          .replace(/{sessionTime}/g, formData.sessionTime)

        const response = await fetch('/api/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            message: personalizedMessage,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send SMS')
        }

        const result = await response.json()
        
        // Store the sent message in localStorage for dashboard
        const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]')
        sentMessages.push({
          ...formData,
          message: personalizedMessage,
          status: 'Sent',
          timestamp: new Date().toISOString(),
          id: result.id || Date.now(),
        })
        localStorage.setItem('sentMessages', JSON.stringify(sentMessages))

        setSuccessMessage('✅ SMS Sent!')
        setSuccessDetails(`Reminder sent successfully to ${formData.name} at ${formData.phone}`)
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Create New Reminder
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Send an SMS reminder to your photography client
        </p>
        
      </div>

      <Form
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                <span className="text-3xl">
                  {successMessage.includes('❌') ? '⚠️' : 
                   successMessage.includes('Opt-in') ? '📋' : '🎉'}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {successMessage}
              </h3>
              
              <p className="text-slate-600 mb-8 leading-relaxed">
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
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
  )
}