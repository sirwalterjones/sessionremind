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
      alert('Client must opt in to receive SMS reminders')
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

        const enrollmentStatus = enrollmentResponse.ok ? ' Enrollment confirmation sent!' : ' (Enrollment failed)'
        alert(`${result.scheduledReminders.length} reminder(s) scheduled successfully!${enrollmentStatus}`)
        router.push('/dashboard')
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

        alert('SMS reminder sent successfully!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error processing request:', error)
      alert('Failed to process request. Please try again.')
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
    </div>
  )
}