"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { forwardRef, useState, useCallback, type InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useAudio } from "./audio-provider"

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  soundEnabled?: boolean
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, error, icon, type, soundEnabled = true, onFocus, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const isPassword = type === "password"
    const audio = useAudio()

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        if (soundEnabled) {
          audio.playSound("hover")
        }
        onFocus?.(e)
      },
      [soundEnabled, audio, onFocus],
    )

    const handleBlur = useCallback(() => {
      setIsFocused(false)
    }, [])

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              "block text-[10px] md:text-xs uppercase tracking-widest font-display transition-colors duration-300",
              isFocused ? "text-cyber-cyan text-glow-cyan" : "text-cyber-cyan/70",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
                isFocused ? "text-cyber-cyan" : "text-cyber-cyan/60",
              )}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "w-full bg-cyber-panel/80 border border-cyber-cyan/30 rounded-sm",
              "px-4 py-3 md:py-3.5 min-h-[48px] text-sm md:text-base text-foreground",
              "placeholder:text-muted-foreground/50 placeholder:text-xs md:placeholder:text-sm",
              "focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,255,255,0.3),inset_0_0_10px_rgba(0,255,255,0.1)]",
              "transition-all duration-300",
              "hover:border-cyber-cyan/50",
              "touch-manipulation",
              icon && "pl-10",
              isPassword && "pr-12",
              error && "border-cyber-red focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,7,58,0.3)]",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword)
                if (soundEnabled) audio.playSound("click")
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-cyber-cyan/60 hover:text-cyber-cyan active:scale-95 transition-all touch-manipulation"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {/* HUD corner decorations */}
          <div
            className={cn(
              "absolute top-0 left-0 w-2 h-2 border-l border-t transition-colors duration-300",
              isFocused ? "border-cyber-cyan" : "border-cyber-cyan/50",
            )}
          />
          <div
            className={cn(
              "absolute top-0 right-0 w-2 h-2 border-r border-t transition-colors duration-300",
              isFocused ? "border-cyber-cyan" : "border-cyber-cyan/50",
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 w-2 h-2 border-l border-b transition-colors duration-300",
              isFocused ? "border-cyber-cyan" : "border-cyber-cyan/50",
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 right-0 w-2 h-2 border-r border-b transition-colors duration-300",
              isFocused ? "border-cyber-cyan" : "border-cyber-cyan/50",
            )}
          />
        </div>
        {error && <p className="text-[10px] md:text-xs text-cyber-red font-alert animate-pulse">{error}</p>}
      </div>
    )
  },
)

CyberInput.displayName = "CyberInput"
