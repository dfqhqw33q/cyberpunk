"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes, useCallback, useRef } from "react"
import { useAudio } from "./audio-provider"

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  soundEnabled?: boolean
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      soundEnabled = true,
      onMouseEnter,
      onClick,
      ...props
    },
    ref,
  ) => {
    const audio = useAudio()
    const lastHoverRef = useRef(0)

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Throttle hover sounds
        const now = Date.now()
        if (soundEnabled && now - lastHoverRef.current > 100) {
          audio.playSound("hover")
          lastHoverRef.current = now
        }
        onMouseEnter?.(e)
      },
      [soundEnabled, audio, onMouseEnter],
    )

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (soundEnabled && !disabled && !loading) {
          audio.playSound("click")
        }
        onClick?.(e)
      },
      [soundEnabled, disabled, loading, audio, onClick],
    )

    const variants = {
      primary: cn(
        "bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan",
        "hover:bg-cyber-cyan hover:text-cyber-black hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]",
        "active:scale-95",
      ),
      secondary: cn(
        "bg-cyber-magenta/10 border-cyber-magenta text-cyber-magenta",
        "hover:bg-cyber-magenta hover:text-cyber-black hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]",
        "active:scale-95",
      ),
      danger: cn(
        "bg-cyber-red/10 border-cyber-red text-cyber-red",
        "hover:bg-cyber-red hover:text-white hover:shadow-[0_0_20px_rgba(255,7,58,0.5)]",
        "active:scale-95",
      ),
      ghost: cn(
        "bg-transparent border-cyber-cyan/30 text-cyber-cyan/70",
        "hover:border-cyber-cyan hover:text-cyber-cyan hover:bg-cyber-cyan/10",
        "active:scale-95",
      ),
    }

    const sizes = {
      sm: "px-3 py-2 text-xs min-h-[40px]",
      md: "px-5 py-3 text-sm min-h-[48px]",
      lg: "px-8 py-4 text-base min-h-[56px]",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        className={cn(
          "relative font-display uppercase tracking-wider border rounded-sm",
          "transition-all duration-300 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none",
          "glitch-hover",
          "touch-manipulation select-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-1.5 h-1.5 border-l border-t border-current" />
        <span className="absolute top-0 right-0 w-1.5 h-1.5 border-r border-t border-current" />
        <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-l border-b border-current" />
        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-r border-b border-current" />
      </button>
    )
  },
)

CyberButton.displayName = "CyberButton"
