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
      }))
    }
  }, [initialData])

  const [showPasteArea, setShowPasteArea] = useState(false)
  const pasteAreaRef = useRef<HTMLTextAreaElement>(null)
  
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  // Smart clipboard parsing for UseSession data
  const parseClipboardData = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const allText = text.toLowerCase()
    
    const extractedData: Partial<FormData> = {}

    // Enhanced patterns for better extraction
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const phonePattern = /[\+]?[1]?[\s\-\.]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}/
    const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+$/
    const datePattern = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\\n]*[0-9]{4}[^\\n]*[0-9]{1,2}:[0-9]{2}[^\\n]*(AM|PM)/gi

    // Extract email
    const emailMatch = text.match(emailPattern)
    if (emailMatch) {
      extractedData.email = emailMatch[0]
    }

    // Extract phone
    const phoneMatch = text.match(phonePattern)
    if (phoneMatch) {
      extractedData.phone = phoneMatch[0]
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
      console.log('Clipboard text:', text)
      const parsed = parseClipboardData(text)
      console.log('Parsed data:', parsed)
      
      // Update form with parsed data
      setFormData(prev => {
        const newData = { ...prev, ...parsed }
        console.log('New form data:', newData)
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
      setFormData(prev => ({ ...prev, ...parsed }))
      setShowPasteArea(false)
      const foundFields = Object.keys(parsed).filter(key => parsed[key as keyof FormData])
      alert(`✅ Data imported!\n\nFound: ${foundFields.length > 0 ? foundFields.join(', ') : 'No fields detected'}`)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Quick Import Section */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                <ClipboardDocumentIcon className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Import</h3>
                <p className="text-sm text-gray-600">Copy data from UseSession and paste here</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePasteAndParse}
              className="inline-flex items-center px-4 py-2 bg-rose-400 text-white font-medium rounded-full hover:bg-rose-500 transition-all duration-200 text-sm"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Import Data
            </button>
          </div>
          
          {showPasteArea && (
            <div className="space-y-3">
              <textarea
                ref={pasteAreaRef}
                placeholder="Paste your UseSession data here (name, email, phone, session details)..."
                className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200 resize-none"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleManualPaste}
                  className="px-4 py-2 bg-rose-400 text-white font-medium rounded-full hover:bg-rose-500 transition-all duration-200 text-sm"
                >
                  Parse Data
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasteArea(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Client Information Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-rose-600 text-xl">👤</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Client Information</h3>
              <p className="text-gray-600">Who's coming to the session?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                📝 Client Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
                placeholder="e.g., Sarah Johnson"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-800 mb-2">
                📱 Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
                placeholder="e.g., (555) 123-4567"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                ✉️ Email Address <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
                placeholder="e.g., sarah@example.com"
              />
            </div>
          </div>
        </div>

        {/* Session Details Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-purple-600 text-xl">📸</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Session Details</h3>
              <p className="text-gray-600">What type of session and when?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="sessionTitle" className="block text-sm font-medium text-gray-800 mb-2">
                🎯 Session Type
              </label>
              <input
                type="text"
                name="sessionTitle"
                id="sessionTitle"
                required
                value={formData.sessionTitle}
                onChange={(e) => handleChange('sessionTitle', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
                placeholder="e.g., Sunflower Field Summer 2025"
              />
            </div>

            <div>
              <label htmlFor="sessionTime" className="block text-sm font-medium text-gray-800 mb-2">
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
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Message Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl">💬</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Your Message</h3>
              <p className="text-gray-600">Customize what your client will receive</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-800 mb-2">
                📝 SMS Message
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200 resize-none"
                placeholder="Your personalized message..."
              />
              <div className="mt-2 text-sm text-gray-500">
                💡 Use {'{name}'}, {'{sessionTitle}'}, and {'{sessionTime}'} for automatic personalization
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <div className="flex items-start">
                <Switch
                  checked={formData.optedIn}
                  onChange={(checked) => handleChange('optedIn', checked)}
                  className={`${
                    formData.optedIn ? 'bg-green-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mt-1`}
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
                  <span className="text-base font-medium text-green-800">
                    ✅ Client has opted in to SMS reminders
                  </span>
                  <p className="text-sm text-green-700 mt-1">
                    Required for compliance with SMS regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-amber-600 text-xl">⏰</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Scheduling Options</h3>
              <p className="text-gray-600">When should reminders be sent?</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start">
                <Switch
                  checked={formData.schedulingEnabled}
                  onChange={(checked) => handleChange('schedulingEnabled', checked)}
                  className={`${
                    formData.schedulingEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-1`}
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
                  <span className="text-base font-medium text-blue-800">
                    📅 Enable automatic reminder scheduling
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    Send reminders automatically before the session
                  </p>
                </div>
              </div>
            </div>

            {formData.schedulingEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="threeDayReminder"
                      checked={formData.threeDayReminder}
                      onChange={(e) => handleChange('threeDayReminder', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="threeDayReminder" className="ml-3">
                      <span className="text-sm font-medium text-purple-800">3-Day Reminder</span>
                      <p className="text-xs text-purple-600">Sent 3 days before session</p>
                    </label>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="oneDayReminder"
                      checked={formData.oneDayReminder}
                      onChange={(e) => handleChange('oneDayReminder', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="oneDayReminder" className="ml-3">
                      <span className="text-sm font-medium text-orange-800">1-Day Reminder</span>
                      <p className="text-xs text-orange-600">Sent 1 day before session</p>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-8 py-4 font-medium rounded-full transition-all duration-200 shadow-sm text-lg ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-rose-400 text-white hover:bg-rose-500 hover:shadow-md transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending...
              </>
            ) : (
              <>
                <span className="mr-3">🚀</span>
                {formData.schedulingEnabled ? 'Schedule Reminders' : 'Send SMS Now'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}