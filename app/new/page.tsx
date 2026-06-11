'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
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
  sendManualText: boolean
  manualMessage: string
}

export default function NewReminder() {
  // useSearchParams must be inside a Suspense boundary (Next.js 14 requirement).
  return (
    <Suspense fallback={null}>
      <NewReminderContent />
    </Suspense>
  )
}

function NewReminderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<Partial<FormData>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  // 'success' drives the dashboard / send-another actions; 'notice' and 'error'
  // only offer dismissal (same branching the page has always had).
  const [resultKind, setResultKind] = useState<'success' | 'notice' | 'error'>('success')
  const [successMessage, setSuccessMessage] = useState('')
  const [successDetails, setSuccessDetails] = useState('')
  // Per-user studio name (multi-tenant) — never hard-coded. Pulled from the
  // photographer's settings (auto-filled from their UseSession business name).
  const [studioName, setStudioName] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.settings?.studioName) setStudioName(data.settings.studioName)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const extractDataFromSharedUrl = async (url: string) => {
    try {
      // Show loading state in the form while the server extracts the booking.
      setInitialData(prev => ({
        ...prev,
        sessionTitle: 'Extracting from UseSession…'
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
          const newData = {
            name: result.data.name || '',
            email: result.data.email || '',
            phone: result.data.phone || '',
            sessionTitle: result.data.sessionTitle || 'Photography Session',
            sessionTime: result.data.sessionTime || ''
          }

          setInitialData(prev => ({
            ...prev,
            ...newData
          }))
        } else {
          throw new Error('Failed to extract data - no data in response')
        }
      } else {
        throw new Error(`Server extraction failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Error processing shared URL:', error)
      // Surface the failure where the loading text was shown
      setInitialData(prev => ({
        ...prev,
        sessionTitle: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
    }
  }

  useEffect(() => {
    // Check for PWA share target
    const sharedUrl = searchParams.get('shared_url')
    const url = searchParams.get('url') // Alternative parameter name

    const targetUrl = sharedUrl || url
    if (targetUrl) {
      // Show that we received a shared URL
      setInitialData(prev => ({
        ...prev,
        sessionTitle: 'Processing shared URL…'
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
    if (!formData.optedIn) {
      setResultKind('notice')
      setSuccessMessage('Opt-in required')
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
        registrationMessage = `Hi ${formData.name}! You're registered for text reminders from ${studioName || 'our studio'}. Your ${formData.sessionTitle} session is scheduled for ${formData.sessionTime}. Looking forward to seeing you!`

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
      }

      // 2. Send manual text immediately (if enabled)
      let manualTextSent = false
      let finalManualMessage = ''

      if (formData.sendManualText) {
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
      }

      // 3. Schedule reminders if selected (but not if manual text was sent)
      if ((formData.threeDayReminder || formData.oneDayReminder) && !manualTextSent) {
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
        let successMsg = ''
        if (sentCount > 0 && scheduledCount > 0) {
          successMsg = 'Messages sent & reminders scheduled'
        } else if (sentCount > 0) {
          successMsg = 'Messages sent'
        } else {
          successMsg = 'Reminders scheduled'
        }

        setResultKind('success')
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

          setSuccessMessage('Messages sent')
          setSuccessDetails(details)
        } else {
          // No messages sent at all
          setSuccessMessage('Setup complete')
          setSuccessDetails(`${formData.name} has been set up in the system without any messages sent.`)
        }
        setResultKind('success')
        setShowSuccess(true)
      }
    } catch (error) {
      console.error('Error processing request:', error)
      setResultKind('error')
      setSuccessMessage('Something went wrong')
      setSuccessDetails('Failed to process request. Please check your SMS credentials and try again.')
      setShowSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl text-ink">
      <div className="border-b border-hairline pb-6 mb-8">
        <p className="eyebrow mb-3">Manual reminder</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
          New reminder
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Send a confirmation and schedule SMS reminders for a single client.
        </p>
      </div>

      <Form
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Result modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-hairline bg-card p-8 text-center shadow-2xl">
            {resultKind === 'success' ? (
              <CheckCircleIcon className="mx-auto h-10 w-10 text-accent" />
            ) : (
              <ExclamationCircleIcon className="mx-auto h-10 w-10 text-amber-700 dark:text-amber-200" />
            )}

            <h3 className="font-display mt-4 text-2xl font-semibold text-ink">
              {successMessage}
            </h3>

            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {successDetails}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setShowSuccess(false)
                  if (resultKind === 'success') {
                    router.push('/dashboard')
                  }
                }}
                className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-ink transition-shadow hover:shadow-glow"
              >
                {resultKind === 'success' ? 'View dashboard' : 'Got it'}
              </button>

              {resultKind === 'success' && (
                <button
                  onClick={() => {
                    setShowSuccess(false)
                    // Reset form for another reminder
                    window.location.reload()
                  }}
                  className="rounded-full border border-hairline px-6 py-2.5 font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  Send another
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
