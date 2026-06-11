'use client'

import React, { useState, useEffect } from 'react'
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

const inputCls =
  'w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40'

function Toggle({
  checked,
  onChange,
  srLabel,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  srLabel: string
}) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${
        checked ? 'bg-accent' : 'bg-white/15'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas`}
    >
      <span className="sr-only">{srLabel}</span>
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  )
}

function PlaceholderChips({ onInsert }: { onInsert: (placeholder: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <span className="mr-0.5">Insert:</span>
      {['{name}', '{sessionTitle}', '{sessionTime}'].map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onInsert(p)}
          className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {p}
        </button>
      ))}
    </div>
  )
}

function OptInRow({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-hairline bg-panel p-4">
      <div className="mt-0.5">
        <Toggle checked={checked} onChange={onChange} srLabel="Client has opted in to SMS" />
      </div>
      <div>
        <span className="text-sm font-medium text-ink">Client has opted in to SMS reminders</span>
        <p className="mt-0.5 text-xs text-muted">Required for compliance with SMS regulations.</p>
      </div>
    </div>
  )
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-ink">

      {/* Client */}
      <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
        <h3 className="font-display text-lg font-semibold">Client</h3>
        <p className="mt-0.5 text-sm text-muted">Who&apos;s coming to the session.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="eyebrow mb-2 block">
              Client name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputCls}
              placeholder="Sarah Johnson"
            />
          </div>

          <div>
            <label htmlFor="phone" className="eyebrow mb-2 block">
              Phone number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={inputCls}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="eyebrow mb-2 block">
              Email <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={inputCls}
              placeholder="sarah@example.com"
            />
          </div>
        </div>
      </section>

      {/* Session */}
      <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
        <h3 className="font-display text-lg font-semibold">Session</h3>
        <p className="mt-0.5 text-sm text-muted">What they booked and when.</p>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="sessionTitle" className="eyebrow mb-2 block">
              Session type
            </label>
            <input
              type="text"
              name="sessionTitle"
              id="sessionTitle"
              required
              value={formData.sessionTitle}
              onChange={(e) => handleChange('sessionTitle', e.target.value)}
              className={inputCls}
              placeholder="Sunflower Field Summer 2025"
            />
          </div>

          <div>
            <label htmlFor="sessionTime" className="eyebrow mb-2 block">
              Date &amp; time
            </label>
            <input
              type="text"
              name="sessionTime"
              id="sessionTime"
              required
              placeholder="Sunday, June 29th, 2025 at 8:20 PM"
              value={formData.sessionTime}
              onChange={(e) => handleChange('sessionTime', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Reminder message — hidden when manual text is enabled */}
      {!formData.sendManualText && (
        <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
          <h3 className="font-display text-lg font-semibold">Reminder message</h3>
          <p className="mt-0.5 text-sm text-muted">What your client receives before the session.</p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="message" className="eyebrow mb-2 block">
                SMS message
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Your message…"
              />
              <PlaceholderChips onInsert={(p) => insertPlaceholder('message', p)} />
            </div>

            <OptInRow checked={formData.optedIn} onChange={(checked) => handleChange('optedIn', checked)} />
          </div>
        </section>
      )}

      {/* Schedule — hidden when manual text is enabled */}
      {!formData.sendManualText && (
        <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
          <h3 className="font-display text-lg font-semibold">Schedule</h3>
          <p className="mt-0.5 text-sm text-muted">When messages go out.</p>

          <div className="mt-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5">
                <Toggle
                  checked={formData.sendRegistrationMessage}
                  onChange={(checked) => handleChange('sendRegistrationMessage', checked)}
                  srLabel="Send registration confirmation"
                />
              </div>
              <div>
                <span className="text-sm font-medium text-ink">Registration confirmation</span>
                <p className="mt-0.5 text-xs text-muted">
                  One text sent now to confirm the booking and session details.
                </p>
              </div>
            </div>

            <div className="border-t border-hairline pt-5">
              <p className="eyebrow mb-3">Automatic reminders</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="threeDayReminder"
                    checked={formData.threeDayReminder}
                    onChange={(e) => handleChange('threeDayReminder', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-hairline accent-[#C6F24E]"
                  />
                  <label htmlFor="threeDayReminder">
                    <span className="text-sm font-medium text-ink">3-day reminder</span>
                    <p className="text-xs text-muted">Sent 3 days before the session at 10:00 AM.</p>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="oneDayReminder"
                    checked={formData.oneDayReminder}
                    onChange={(e) => handleChange('oneDayReminder', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-hairline accent-[#C6F24E]"
                  />
                  <label htmlFor="oneDayReminder">
                    <span className="text-sm font-medium text-ink">1-day reminder</span>
                    <p className="text-xs text-muted">Sent 1 day before the session at 10:00 AM.</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Manual text */}
      <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Manual text</h3>
            <p className="mt-0.5 text-sm text-muted">
              Send one custom message right now instead of the schedule above.
            </p>
          </div>
          <div className="mt-1">
            <Toggle
              checked={formData.sendManualText}
              onChange={(checked) => handleChange('sendManualText', checked)}
              srLabel="Send manual text message"
            />
          </div>
        </div>

        {formData.sendManualText && (
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="manualMessage" className="eyebrow mb-2 block">
                Custom message
              </label>
              <textarea
                name="manualMessage"
                id="manualMessage"
                rows={3}
                value={formData.manualMessage}
                onChange={(e) => handleChange('manualMessage', e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Your message…"
              />
              <PlaceholderChips onInsert={(p) => insertPlaceholder('manualMessage', p)} />
            </div>

            <OptInRow checked={formData.optedIn} onChange={(checked) => handleChange('optedIn', checked)} />
          </div>
        )}
      </section>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-3 font-semibold text-accent-ink transition-shadow hover:shadow-[0_0_30px_-5px_rgba(198,242,78,0.6)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/30 border-t-accent-ink" />
          )}
          {isSubmitting ? 'Sending…' : 'Send messages'}
        </button>
      </div>
    </form>
  )
}
