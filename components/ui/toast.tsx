"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

type ToastType = "success" | "error" | "info" | "neutral"

type Toast = {
  id: string
  title: string
  description?: string
  type?: ToastType
}

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = String(Date.now())
    const toastItem: Toast = { id, ...t }
    setToasts((s) => [toastItem, ...s])
    // auto remove
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((title: string, description?: string) => toast({ title, description, type: "success" }), [toast])
  const error = useCallback((title: string, description?: string) => toast({ title, description, type: "error" }), [toast])
  const info = useCallback((title: string, description?: string) => toast({ title, description, type: "info" }), [toast])

  const value = useMemo(() => ({ toast, success, error, info }), [toast, success, error, info])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} onDismiss={(id) => setToasts((s) => s.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

function ToastPortal({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start justify-between w-80 rounded-lg px-4 py-3 shadow-md border text-sm transition-all
            ${
              t.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : t.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : t.type === "info"
                ? "bg-blue-50 text-blue-800 border-blue-200"
                : "bg-gray-50 text-gray-800 border-gray-200"
            }`}
        >
          <div>
            <div className="font-medium">{t.title}</div>
            {t.description && <div className="text-xs mt-0.5 opacity-80">{t.description}</div>}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-gray-500 hover:text-gray-700 ml-3"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}

export default ToastProvider
