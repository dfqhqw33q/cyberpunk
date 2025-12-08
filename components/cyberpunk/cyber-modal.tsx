"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"

interface CyberModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function CyberModal({ isOpen, onClose, title, children, className, size = "md" }: CyberModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] md:max-w-[90vw]",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-cyber-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full glass-panel rounded-sm",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "max-h-[95vh] sm:max-h-[90vh] flex flex-col",
          sizeClasses[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-cyber-cyan/20 shrink-0">
          <h2 className="font-display text-base sm:text-lg uppercase tracking-wider text-cyber-cyan text-glow-cyan pr-8 truncate">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-cyber-red active:bg-cyber-red/20 transition-colors rounded-sm hover:bg-cyber-red/10 touch-manipulation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1 overscroll-contain">{children}</div>

        {/* HUD corners */}
        <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2 border-cyber-cyan pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-t-2 border-cyber-cyan pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-b-2 border-cyber-cyan pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-b-2 border-cyber-cyan pointer-events-none" />
      </div>
    </div>
  )
}
