"use client"

import { useState, useEffect } from "react"

export type ToastVariant = "default" | "success" | "error"

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

type ToastInput = {
  message: string
  variant?: ToastVariant
  duration?: number
}

// Tipado del store global en window
declare global {
  interface Window {
    __toastItems: Toast[]
    __toastListeners: Set<(toasts: Toast[]) => void>
  }
}

// Accesores al store real — window es el único singleton garantizado en browser
// independientemente de cuántos chunks carguen este módulo
function getItems(): Toast[] {
  if (typeof window === "undefined") return []
  if (!window.__toastItems) window.__toastItems = []
  return window.__toastItems
}

function getListeners(): Set<(toasts: Toast[]) => void> {
  if (typeof window === "undefined") return new Set()
  if (!window.__toastListeners) window.__toastListeners = new Set()
  return window.__toastListeners
}

function _notify() {
  const snapshot = [...getItems()]
  getListeners().forEach((fn) => fn(snapshot))
}

function _add(input: ToastInput) {
  if (typeof window === "undefined") return
  const id = Math.random().toString(36).slice(2)
  const item: Toast = { variant: "default", duration: 4000, ...input, id }
  window.__toastItems = [...getItems(), item]
  _notify()
  setTimeout(() => _remove(id), item.duration)
}

function _remove(id: string) {
  if (typeof window === "undefined") return
  window.__toastItems = getItems().filter((t) => t.id !== id)
  _notify()
}

// API pública — se importa y llama desde cualquier cliente sin hooks
export const toast = {
  show: (message: string) => _add({ message, variant: "default" }),
  success: (message: string) => _add({ message, variant: "success" }),
  error: (message: string) => _add({ message, variant: "error" }),
}

// Hook interno — solo lo usa el componente Toaster
export function useToastStore() {
  const [items, setItems] = useState<Toast[]>(() => getItems())

  useEffect(() => {
    const listeners = getListeners()
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return { items, remove: _remove }
}
