"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToastStore } from "@/hooks/use-toast"

export function Toaster() {
  const { items, remove } = useToastStore()

  if (items.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            "flex min-w-64 max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md",
            item.variant === "success" &&
              "border-green-200 bg-green-50 text-green-800",
            item.variant === "error" &&
              "border-destructive/30 bg-destructive/10 text-destructive",
            item.variant === "default" &&
              "border-border bg-card text-foreground"
          )}
        >
          <span className="flex-1 leading-snug">{item.message}</span>
          <button
            onClick={() => remove(item.id)}
            aria-label="Cerrar notificación"
            className="mt-px shrink-0 opacity-50 transition-opacity hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
