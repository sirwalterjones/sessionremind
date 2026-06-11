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
        checked ? 'bg-accent' : 'bg-ink/15'
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

  const manual = formData.sendManualText
  const activeField: 'message' | 'manualMessage' = manual ? 'manualMessage' : 'message'

  // Live preview: render the active template with real form values (sample
  // values when a field is still empty).
  const preview = (formData[activeField] || '')
    .replace(/\{name\}/g, formData.name || 'Sarah')
    .replace(/\{sessionTitle\}/g, formData.sessionTitle || 'Sunflower Mini')
    .replace(/\{sessionTime\}/g, formData.sessionTime || 'Saturday at 10:00 AM')
  const previewLen = preview.length
  const segments = previewLen === 0 ? 0 : previewLen <= 160 ? 1 : Math.ceil(previewLen / 153)

  // What will actually go out, for the rail summary.
  const sends: string[] = manual
    ? ['One text, sent now']
    : [
        ...(formData.sendRegistrationMessage ? ['Confirmation — now'] : []),
        ...(formData.threeDayReminder ? ['Reminder — 3 days before'] : []),
        ...(formData.oneDayReminder ? ['Reminder — 1 day before'] : []),
      ]

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-5 text-ink lg:grid-cols-[minmax(0,1fr)_380px]">

      {/* ───────── Left column: booking + message ───────── */}
      <div className="min-w-0 space-y-5">

        {/* Booking: client + session in one card */}
        <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
          <h3 className="font-display text-lg font-semibold">Booking</h3>
          <p className="mt-0.5 text-sm text-muted">Who&apos;s coming, and what they booked.</p>

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

        {/* Message: mode switch + the active template */}
        <section className="rounded-2xl border border-hairline bg-panel p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Message</h3>
              <p className="mt-0.5 text-sm text-muted">
                {manual
                  ? 'One custom text, sent immediately.'
                  : 'What your client receives before the session.'}
              </p>
            </div>

            {/* Mode switch — drives the same sendManualText flag as before */}
            <div className="inline-flex rounded-full border border-hairline bg-card p-1" role="tablist" aria-label="Send mode">
              <button
                type="button"
                role="tab"
                aria-selected={!manual}
                onClick={() => handleChange('sendManualText', false)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !manual ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'
                }`}
              >
                Scheduled
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={manual}
                onClick={() => handleChange('sendManualText', true)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  manual ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'
                }`}
              >
                Send now
              </button>
            </div>
          </div>

          <div className="mt-6">
            {manual ? (
              <div key="manual">
                <label htmlFor="manualMessage" className="eyebrow mb-2 block">
                  Custom message
                </label>
                <textarea
                  name="manualMessage"
                  id="manualMessage"
                  rows={4}
                  value={formData.manualMessage}
                  onChange={(e) => handleChange('manualMessage', e.target.value)}
                  className={`${inputCls} resize-none`}
                  placeholder="Your message…"
                />
                <PlaceholderChips onInsert={(p) => insertPlaceholder('manualMessage', p)} />
              </div>
            ) : (
              <div key="scheduled">
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
            )}
          </div>
        </section>
      </div>

      {/* ───────── Right rail: preview + delivery + send ───────── */}
      <aside className="space-y-5 lg:sticky lg:top-8">

        {/* Live preview */}
        <section className="rounded-2xl border border-hairline bg-panel p-5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            <span>Preview · SMS</span>
            <span className="flex items-center gap-2 text-muted">
              <span className="led inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Live
            </span>
          </div>
          <div className="mt-4 rounded-2xl rounded-bl-md border border-hairline bg-card p-4">
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">
              {preview || 'Your message will appear here…'}
            </p>
          </div>
          <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {previewLen} chars · ≈{segments} SMS segment{segments === 1 ? '' : 's'}
          </p>
        </section>

        {/* Delivery plan */}
        <section className="rounded-2xl border border-hairline bg-panel p-5">
          <h3 className="font-display text-base font-semibold">Delivery</h3>

          {manual ? (
            <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-200">
              Sends immediately. The confirmation and scheduled reminders are paused for this send.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Toggle
                    checked={formData.sendRegistrationMessage}
                    onChange={(checked) => handleChange('sendRegistrationMessage', checked)}
                    srLabel="Send registration confirmation"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-ink">Confirmation now</span>
                  <p className="mt-0.5 text-xs text-muted">
                    One text confirming the booking and session details.
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-hairline pt-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="threeDayReminder"
                    checked={formData.threeDayReminder}
                    onChange={(e) => handleChange('threeDayReminder', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-hairline accent-[rgb(var(--c-accent))]"
                  />
                  <label htmlFor="threeDayReminder">
                    <span className="text-sm font-medium text-ink">3-day reminder</span>
                    <p className="text-xs text-muted">3 days before the session at 10:00 AM.</p>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="oneDayReminder"
                    checked={formData.oneDayReminder}
                    onChange={(e) => handleChange('oneDayReminder', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-hairline accent-[rgb(var(--c-accent))]"
                  />
                  <label htmlFor="oneDayReminder">
                    <span className="text-sm font-medium text-ink">1-day reminder</span>
                    <p className="text-xs text-muted">1 day before the session at 10:00 AM.</p>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* What goes out, at a glance */}
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="eyebrow mb-2">Will send</p>
            {sends.length ? (
              <ul className="space-y-1.5">
                {sends.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-xs text-muted">
                    <span className="inline-block h-1 w-1 rounded-full bg-accent" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-faint">Nothing selected — no texts will go out.</p>
            )}
          </div>

          {/* Opt-in — required in both modes */}
          <div className="mt-4 flex items-start gap-3.5 rounded-xl border border-hairline bg-card p-4">
            <div className="mt-0.5">
              <Toggle
                checked={formData.optedIn}
                onChange={(checked) => handleChange('optedIn', checked)}
                srLabel="Client has opted in to SMS"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-ink">Client has opted in to SMS reminders</span>
              <p className="mt-0.5 text-xs text-muted">Required for compliance with SMS regulations.</p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-3 font-semibold text-accent-ink transition-shadow hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/30 border-t-accent-ink" />
          )}
          {isSubmitting ? 'Sending…' : manual ? 'Send text' : 'Send & schedule'}
        </button>
      </aside>
    </form>
  )
}
