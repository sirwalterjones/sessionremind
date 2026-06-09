'use client'

// Lightweight, dependency-free notification system: stacked toasts + a
// promise-based confirm modal. Matches the Swiss-editorial design (ink type,
// hairline borders, one accent). Wrap the app once in <NotificationsProvider>,
// then use useToast() / useConfirm() anywhere below it.

import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  title?: string
  message: string
}

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

interface NotificationsApi {
  toast: {
    success: (message: string, title?: string) => void
    error: (message: string, title?: string) => void
    info: (message: string, title?: string) => void
  }
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const NotificationsContext = createContext<NotificationsApi | null>(null)

export function useToast() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useToast must be used within <NotificationsProvider>')
  return ctx.toast
}

export function useConfirm() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useConfirm must be used within <NotificationsProvider>')
  return ctx.confirm
}

const DURATION: Record<ToastType, number> = { success: 5000, info: 5000, error: 8000 }

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const idRef = useRef(0)

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, type, message, title }])
      setTimeout(() => remove(id), DURATION[type])
    },
    [remove]
  )

  const toast = useMemo(
    () => ({
      success: (m: string, t?: string) => push('success', m, t),
      error: (m: string, t?: string) => push('error', m, t),
      info: (m: string, t?: string) => push('info', m, t),
    }),
    [push]
  )

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ ...opts, resolve })
      }),
    []
  )

  const closeConfirm = useCallback((result: boolean) => {
    setConfirmState((s) => {
      s?.resolve(result)
      return null
    })
  }, [])

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <NotificationsContext.Provider value={value}>
      {children}

      {/* Toast viewport */}
      <div className="pointer-events-none fixed bottom-4 right-4 left-4 z-[100] flex flex-col gap-2.5 sm:left-auto sm:w-96">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && <ConfirmModal state={confirmState} onClose={closeConfirm} />}
    </NotificationsContext.Provider>
  )
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const accent =
    toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#DD4D24'
  const glyph = toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'i'
  return (
    <div className="sr-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-[#ECEAE4] bg-white px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
      <span
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: accent }}
        aria-hidden
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        {toast.title && <div className="text-sm font-semibold text-[#141414]">{toast.title}</div>}
        <div className="break-words text-[13px] leading-snug text-[#5F5B54]">{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="-mr-1 text-lg leading-none text-[#9A958C] transition-colors hover:text-[#141414]"
      >
        ×
      </button>
    </div>
  )
}

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: (result: boolean) => void }) {
  const danger = state.tone === 'danger'
  return (
    <div
      className="sr-fade-in fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={() => onClose(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        className="sr-pop-in relative w-full max-w-sm rounded-2xl border border-[#ECEAE4] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {state.title && (
          <h2 className="font-display mb-1.5 text-lg font-semibold text-[#141414]">{state.title}</h2>
        )}
        <p className="text-sm leading-relaxed text-[#5F5B54]">{state.message}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={() => onClose(false)}
            className="rounded-full border border-[#ECEAE4] px-4 py-2 text-sm font-medium text-[#141414] transition-colors hover:bg-[#FAFAF8]"
          >
            {state.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={() => onClose(true)}
            className="rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: danger ? '#dc2626' : '#141414' }}
          >
            {state.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
