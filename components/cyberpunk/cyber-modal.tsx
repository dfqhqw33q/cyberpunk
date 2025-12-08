"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

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
  const contentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
      
      // Add passive touch listener to overlay
      const overlay = overlayRef.current
      if (overlay) {
        const handleTouchMove = (e: TouchEvent) => {
          // Allow scrolling within the modal content
          if (contentRef.current && contentRef.current.contains(e.target as Node)) {
            return
          }
          // Prevent scrolling on the overlay background
          e.preventDefault()
        }
        
        overlay.addEventListener("touchmove", handleTouchMove, { passive: false })
        return () => {
          overlay.removeEventListener("touchmove", handleTouchMove)
          document.body.style.overflow = ""
          document.documentElement.style.overflow = ""
        }
      }
      
      return () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
  }, [isOpen])

  useEffect(() => {
    // Check if content is scrollable
    if (contentRef.current) {
      setHasScroll(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [isOpen, children])

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
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      role="presentation"
      style={{ overscrollBehavior: "none" }}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full mx-auto glass-panel rounded-sm",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "max-h-[95vh] md:max-h-[90vh] flex flex-col",
          "my-4 sm:my-6 mx-2 sm:mx-4 md:mx-auto",
          sizeClasses[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 md:p-5 border-b border-cyber-cyan/20 shrink-0">
          <h2
            id="modal-title"
            className="font-display text-sm sm:text-base md:text-lg uppercase tracking-wider text-cyber-cyan text-glow-cyan flex-1 min-w-0"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "shrink-0 p-2 w-10 h-10 flex items-center justify-center",
              "text-muted-foreground hover:text-cyber-red",
              "active:bg-cyber-red/20 hover:bg-cyber-red/10",
              "border border-transparent rounded-sm",
              "transition-colors duration-200 touch-manipulation",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50",
            )}
            aria-label="Close modal"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable with improved mobile support */}
        <div
          ref={contentRef}
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6",
            hasScroll && "pr-2 sm:pr-3",
          )}
          onTouchMove={(e) => {
            // Allow touch scrolling
            e.stopPropagation()
          }}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
            WebkitTouchCallout: "none",
          } as React.CSSProperties}
        >
          <div className="w-full">
            {children}
          </div>
        </div>

        {/* HUD corners - decorative elements */}
        <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-t-2 border-cyber-cyan pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-t-2 border-cyber-cyan pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-l-2 border-b-2 border-cyber-cyan pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-r-2 border-b-2 border-cyber-cyan pointer-events-none" />
      </div>
    </div>
  )
}
