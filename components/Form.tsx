'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'

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
    sendRegistrationMessage: initialData.sendRegistrationMessage !== false,
    threeDayReminder: initialData.threeDayReminder || true,
    oneDayReminder: initialData.oneDayReminder || true,
    sendManualText: initialData.sendManualText || false,
    manualMessage: initialData.manualMessage || 'Hi {name}! Just wanted to reach out about your {sessionTitle} session. Let me know if you have any questions!',
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
  
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const insertPlaceholder = (field: 'message' | 'manualMessage', placeholder: string) => {
    const currentValue = formData[field]
    const newValue = currentValue + placeholder
    handleChange(field, newValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Client Information Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-stone-600 text-xl">👤</span>
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
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all duration-200"
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
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all duration-200"
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
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all duration-200"
                placeholder="e.g., sarah@example.com"
              />
            </div>
          </div>
        </div>

        {/* Session Details Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-stone-300 rounded-full flex items-center justify-center mr-4">
              <span className="text-stone-700 text-xl">📸</span>
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
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all duration-200"
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
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Message Section - Hidden when manual text is enabled */}
        {!formData.sendManualText && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-stone-400 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl">💬</span>
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
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all duration-200 resize-none"
                placeholder="Your personalized message..."
              />
              <div className="mt-2 text-sm text-gray-500">
                💡 Click to insert: 
                <button
                  type="button"
                  onClick={() => insertPlaceholder('message', '{name}')}
                  className="mx-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-150"
                >
                  {'{name}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertPlaceholder('message', '{sessionTitle}')}
                  className="mx-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-150"
                >
                  {'{sessionTitle}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertPlaceholder('message', '{sessionTime}')}
                  className="mx-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-150"
                >
                  {'{sessionTime}'}
                </button>
              </div>
            </div>

            <div className="bg-stone-100 border border-stone-300 rounded-2xl p-6">
              <div className="flex items-start">
                <Switch
                  checked={formData.optedIn}
                  onChange={(checked) => handleChange('optedIn', checked)}
                  className={`${
                    formData.optedIn ? 'bg-stone-600' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 mt-1`}
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
                  <span className="text-base font-medium text-stone-800">
                    ✅ Client has opted in to SMS reminders
                  </span>
                  <p className="text-sm text-stone-700 mt-1">
                    Required for compliance with SMS regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Scheduling Section - Hidden when manual text is enabled */}
        {!formData.sendManualText && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-stone-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl">📅</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Reminder Schedule</h3>
              <p className="text-gray-600">Choose when to send session reminders</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start">
                <span className="text-blue-600 text-xl mr-3">📧</span>
                <div className="flex-1">
                  <h4 className="text-blue-800 font-semibold mb-2">Registration Confirmation</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Send one confirmation text immediately to register the client and provide their session details.
                  </p>
                  <div className="flex items-center">
                    <Switch
                      checked={formData.sendRegistrationMessage}
                      onChange={(checked) => handleChange('sendRegistrationMessage', checked)}
                      className={`${
                        formData.sendRegistrationMessage ? 'bg-blue-600' : 'bg-gray-300'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">Send registration confirmation</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.sendRegistrationMessage ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </Switch>
                    <span className="ml-3 text-sm font-medium text-blue-800">
                      {formData.sendRegistrationMessage ? 'Send registration confirmation' : 'Skip registration confirmation'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start">
                <span className="text-amber-600 text-xl mr-3">⏰</span>
                <div>
                  <h4 className="text-amber-800 font-semibold mb-2">Reminder Schedule</h4>
                  <p className="text-amber-700 text-sm mb-4">
                    Choose which automatic reminders to send before the session date.
                  </p>
                  <div className="bg-amber-100 border border-amber-300 rounded-xl p-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="threeDayReminder"
                          checked={formData.threeDayReminder}
                          onChange={(e) => handleChange('threeDayReminder', e.target.checked)}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="threeDayReminder" className="ml-3">
                          <span className="text-sm font-medium text-amber-800">3-Day Reminder</span>
                          <p className="text-xs text-amber-700">Sent 3 days before session at 10:00 AM</p>
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="oneDayReminder"
                          checked={formData.oneDayReminder}
                          onChange={(e) => handleChange('oneDayReminder', e.target.checked)}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="oneDayReminder" className="ml-3">
                          <span className="text-sm font-medium text-amber-800">1-Day Reminder</span>
                          <p className="text-xs text-amber-700">Sent 1 day before session at 10:00 AM</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Manual Text Section */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl">💬</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Send Manual Text</h3>
              <p className="text-gray-600">Send a custom message immediately (outside of schedule)</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
              <div className="flex items-start">
                <span className="text-purple-600 text-xl mr-3">⚡</span>
                <div className="flex-1">
                  <h4 className="text-purple-800 font-semibold mb-2">Instant Message</h4>
                  <p className="text-purple-700 text-sm mb-4">
                    Send a custom text message right now, separate from the automated reminder schedule.
                  </p>
                  <div className="flex items-center mb-4">
                    <Switch
                      checked={formData.sendManualText}
                      onChange={(checked) => handleChange('sendManualText', checked)}
                      className={`${
                        formData.sendManualText ? 'bg-purple-600' : 'bg-gray-300'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                    >
                      <span className="sr-only">Send manual text message</span>
                      <span
                        aria-hidden="true"
                        className={`${
                          formData.sendManualText ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </Switch>
                    <span className="ml-3 text-sm font-medium text-purple-800">
                      {formData.sendManualText ? 'Send manual text now' : 'Skip manual text'}
                    </span>
                  </div>
                  
                  {formData.sendManualText && (
                    <div className="mt-4">
                      <label htmlFor="manualMessage" className="block text-sm font-medium text-purple-800 mb-2">
                        Custom Message
                      </label>
                      <textarea
                        name="manualMessage"
                        id="manualMessage"
                        rows={3}
                        value={formData.manualMessage}
                        onChange={(e) => handleChange('manualMessage', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 resize-none"
                        placeholder="Your custom message..."
                      />
                      <div className="mt-2 text-sm text-purple-600">
                        💡 Click to insert: 
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('manualMessage', '{name}')}
                          className="mx-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors duration-150"
                        >
                          {'{name}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('manualMessage', '{sessionTitle}')}
                          className="mx-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors duration-150"
                        >
                          {'{sessionTitle}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertPlaceholder('manualMessage', '{sessionTime}')}
                          className="mx-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors duration-150"
                        >
                          {'{sessionTime}'}
                        </button>
                      </div>
                      
                      {/* Opt-in toggle for manual text */}
                      <div className="mt-6 bg-purple-100 border border-purple-300 rounded-xl p-4">
                        <div className="flex items-start">
                          <Switch
                            checked={formData.optedIn}
                            onChange={(checked) => handleChange('optedIn', checked)}
                            className={`${
                              formData.optedIn ? 'bg-purple-600' : 'bg-gray-300'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mt-1`}
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
                            <span className="text-base font-medium text-purple-800">
                              ✅ Client has opted in to SMS reminders
                            </span>
                            <p className="text-sm text-purple-700 mt-1">
                              Required for compliance with SMS regulations
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                : 'bg-stone-800 text-white hover:bg-stone-900 hover:shadow-md transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending...
              </>
            ) : (
              Send Message(s)
            )}
          </button>
        </div>
      </form>
    </div>
  )
}