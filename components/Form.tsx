'use client'

import { useState, useRef, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import { ClipboardDocumentIcon, SparklesIcon } from '@heroicons/react/24/outline'

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

interface FormProps {
  initialData?: Partial<FormData>
  onSubmit: (data: FormData) => Promise<void>
  isSubmitting?: boolean
}

export default function Form({ initialData = {}, onSubmit, isSubmitting = false }: FormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData.name || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    sessionTitle: initialData.sessionTitle || '',
    sessionTime: initialData.sessionTime || '',
    message: initialData.message || 'Hi {name}! This is a friendly reminder about your {sessionTitle} session scheduled for {sessionTime}. Looking forward to seeing you!',
    optedIn: initialData.optedIn || false,
    schedulingEnabled: initialData.schedulingEnabled || true,
    threeDayReminder: initialData.threeDayReminder || true,
    oneDayReminder: initialData.oneDayReminder || true,
  })
  
  // Update form data when initialData changes
  useEffect(() => {
    if (Object.keys(initialData).some(key => initialData[key as keyof FormData])) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || prev.name,
        phone: initialData.phone || prev.phone,
        email: initialData.email || prev.email,
        sessionTitle: initialData.sessionTitle || prev.sessionTitle,
        sessionTime: initialData.sessionTime || prev.sessionTime,
        message: initialData.message || prev.message,
        optedIn: initialData.optedIn || prev.optedIn,
        schedulingEnabled: initialData.schedulingEnabled !== undefined ? initialData.schedulingEnabled : prev.schedulingEnabled,
        threeDayReminder: initialData.threeDayReminder !== undefined ? initialData.threeDayReminder : prev.threeDayReminder,
        oneDayReminder: initialData.oneDayReminder !== undefined ? initialData.oneDayReminder : prev.oneDayReminder,
      }))
    }
  }, [initialData])
  
  const [showPasteArea, setShowPasteArea] = useState(false)
  const pasteAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const parseClipboardData = (text: string) => {
    const allText = text.replace(/\s+/g, ' ').trim()
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const extractedData: Partial<FormData> = {}

    // Smart parsing patterns
    const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
    const phonePattern = /(\+?1[-.\s]?)?\(?([2-9][0-9]{2})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
    const sessionPattern = /(Mini|Session|Shoot|Portrait|Wedding|Family|Maternity|Newborn|Senior|Engagement|Watermelon|Christmas|Birthday|Holiday|Beach|Studio|Outdoor|Pet|Commercial|Event|Truck|Photo|Photography).{0,30}/gi
    const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December).{1,50}\d{4}.{0,30}\d{1,2}:\d{2}.{0,10}(AM|PM)|(\d{1,2}\/\d{1,2}\/\d{4}).{0,30}\d{1,2}:\d{2}.{0,10}(AM|PM)/gi
    const namePattern = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/

    // Extract email
    const emailMatches = allText.match(emailPattern)
    if (emailMatches && emailMatches.length > 0) {
      extractedData.email = emailMatches[0]
    }

    // Extract phone
    const phoneMatches = allText.match(phonePattern)
    if (phoneMatches && phoneMatches.length > 0) {
      extractedData.phone = phoneMatches[0]
    }

    // Extract session info
    const sessionMatches = allText.match(sessionPattern)
    if (sessionMatches && sessionMatches.length > 0) {
      extractedData.sessionTitle = sessionMatches[0].trim()
    }

    // Extract date/time
    const dateMatches = allText.match(datePattern)
    if (dateMatches && dateMatches.length > 0) {
      extractedData.sessionTime = dateMatches[0].trim()
    }

    // Extract name
    for (const line of lines) {
      const cleanLine = line.trim()
      if (!extractedData.name && 
          namePattern.test(cleanLine) && 
          !cleanLine.includes('@') && 
          !cleanLine.match(/\d{3}/) && 
          cleanLine.length >= 3 && 
          cleanLine.length <= 50) {
        extractedData.name = cleanLine
        break
      }
    }

    return extractedData
  }

  const handlePasteAndParse = async () => {
    try {
      const text = await navigator.clipboard.readText()
      console.log('Clipboard text:', text) // Debug log
      const parsed = parseClipboardData(text)
      console.log('Parsed data:', parsed) // Debug log
      
      // Update form with parsed data
      setFormData(prev => {
        const newData = { ...prev, ...parsed }
        console.log('New form data:', newData) // Debug log
        return newData
      })
      
      setShowPasteArea(false)
      const foundFields = Object.keys(parsed).filter(key => parsed[key as keyof FormData])
      alert(`✅ Data imported!\n\nFound: ${foundFields.length > 0 ? foundFields.join(', ') : 'No fields detected'}\n\nOriginal text: ${text.substring(0, 100)}...`)
    } catch (err) {
      console.error('Clipboard error:', err)
      alert('Could not access clipboard. Please paste manually in the text area below.')
      setShowPasteArea(true)
      setTimeout(() => pasteAreaRef.current?.focus(), 100)
    }
  }

  const handleManualPaste = () => {
    const text = pasteAreaRef.current?.value || ''
    if (text.trim()) {
      const parsed = parseClipboardData(text)
      setFormData(prev => ({
        ...prev,
        ...parsed
      }))
      setShowPasteArea(false)
      alert(`✅ Data imported!\n\nFound: ${Object.keys(parsed).filter(key => parsed[key as keyof FormData]).join(', ')}`)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Client Information Section */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">👤</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Client Information</h3>
              <p className="text-slate-600">Who's coming to the session?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-base font-semibold text-slate-800 mb-2">
                📝 Client Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., Sarah Johnson"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-base font-semibold text-slate-800 mb-2">
                📱 Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., (555) 123-4567"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-base font-semibold text-slate-800 mb-2">
                ✉️ Email Address <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., sarah@example.com"
              />
            </div>
          </div>
        </div>

        {/* Session Details Section */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">📸</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Session Details</h3>
              <p className="text-slate-600">What type of session and when?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="sessionTitle" className="block text-base font-semibold text-slate-800 mb-2">
                🎯 Session Type
              </label>
              <input
                type="text"
                name="sessionTitle"
                id="sessionTitle"
                required
                value={formData.sessionTitle}
                onChange={(e) => handleChange('sessionTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., Watermelon Truck Mini Session"
              />
            </div>

            <div>
              <label htmlFor="sessionTime" className="block text-base font-semibold text-slate-800 mb-2">
                📅 Date & Time
              </label>
              <input
                type="text"
                name="sessionTime"
                id="sessionTime"
                required
                placeholder="e.g., Sunday, June 29th, 2025 at 8:20 PM"
                value={formData.sessionTime}
                onChange={(e) => handleChange('sessionTime', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Message Section */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">💬</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Your Message</h3>
              <p className="text-slate-600">Customize what your client will receive</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-base font-semibold text-slate-800 mb-2">
                📝 SMS Message
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Your personalized message..."
              />
              <div className="mt-2 text-sm text-slate-500">
                💡 Use {'{name}'}, {'{sessionTitle}'}, and {'{sessionTime}'} for automatic personalization
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center">
                <Switch
                  checked={formData.optedIn}
                  onChange={(checked) => handleChange('optedIn', checked)}
                  className={`${
                    formData.optedIn ? 'bg-emerald-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Client has opted in to SMS</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      formData.optedIn ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
                <div className="ml-4">
                  <span className="text-base font-semibold text-emerald-800">
                    ✅ Client has opted in to SMS reminders
                  </span>
                  <p className="text-sm text-emerald-700 mt-1">
                    Required for compliance with SMS regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">⏰</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Automated Scheduling</h3>
              <p className="text-slate-600">Let the system handle reminder timing</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center">
                <Switch
                  checked={formData.schedulingEnabled}
                  onChange={(checked) => handleChange('schedulingEnabled', checked)}
                  className={`${
                    formData.schedulingEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Enable automatic scheduling</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      formData.schedulingEnabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
                <div className="ml-4">
                  <span className="text-base font-semibold text-blue-800">
                    🚀 Enable automatic scheduling
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    Set and forget - reminders sent automatically
                  </p>
                </div>
              </div>
            </div>

            {formData.schedulingEnabled && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">📅 Reminder Schedule</h4>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-white/60 rounded-xl border border-white/40">
                    <Switch
                      checked={formData.threeDayReminder}
                      onChange={(checked) => handleChange('threeDayReminder', checked)}
                      className={`${
                        formData.threeDayReminder ? 'bg-purple-500' : 'bg-gray-300'
                      } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">3-day reminder</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.threeDayReminder ? 'translate-x-4' : 'translate-x-0'
                        } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </Switch>
                    <div className="ml-4">
                      <span className="text-sm font-semibold text-slate-800">
                        📢 3-day advance reminder
                      </span>
                      <p className="text-xs text-slate-600">
                        Sent 3 days before the session at 10:00 AM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-white/60 rounded-xl border border-white/40">
                    <Switch
                      checked={formData.oneDayReminder}
                      onChange={(checked) => handleChange('oneDayReminder', checked)}
                      className={`${
                        formData.oneDayReminder ? 'bg-pink-500' : 'bg-gray-300'
                      } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">1-day reminder</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.oneDayReminder ? 'translate-x-4' : 'translate-x-0'
                        } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </Switch>
                    <div className="ml-4">
                      <span className="text-sm font-semibold text-slate-800">
                        🔔 Final day reminder
                      </span>
                      <p className="text-xs text-slate-600">
                        Sent 1 day before the session at 10:00 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting || !formData.optedIn}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">
                {isSubmitting ? '⏳' : (formData.schedulingEnabled ? '🚀' : '📱')}
              </span>
              <span className="text-lg">
                {isSubmitting ? 'Setting up reminders...' : (formData.schedulingEnabled ? 'Schedule Automatic Reminders' : 'Send Reminder Now')}
              </span>
              {!isSubmitting && (
                <span className="group-hover:translate-x-1 transition-transform text-lg">→</span>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}