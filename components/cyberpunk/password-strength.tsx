"use client"

import { cn } from "@/lib/utils"
import { validatePasswordStrength, type PasswordStrength } from "@/lib/validation"
import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<PasswordStrength | null>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (password) {
      setStrength(validatePasswordStrength(password))
      setAnimate(true)
      const timer = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(timer)
    } else {
      setStrength(null)
    }
  }, [password])

  if (!strength) return null

  const colors = {
    Weak: {
      bar: "bg-cyber-red",
      text: "text-cyber-red",
      glow: "shadow-[0_0_10px_rgba(255,7,58,0.5)]",
      width: "33%",
    },
    Medium: {
      bar: "bg-cyber-yellow",
      text: "text-cyber-yellow",
      glow: "shadow-[0_0_10px_rgba(255,255,0,0.5)]",
      width: "66%",
    },
    Strong: {
      bar: "bg-cyber-green",
      text: "text-cyber-green",
      glow: "shadow-[0_0_10px_rgba(0,255,65,0.5)]",
      width: "100%",
    },
  }

  const currentColor = colors[strength.level]

  const requirements = [
    { key: "minLength", label: "8+ characters", met: strength.requirements.minLength },
    { key: "hasUppercase", label: "Uppercase", met: strength.requirements.hasUppercase },
    { key: "hasLowercase", label: "Lowercase", met: strength.requirements.hasLowercase },
    { key: "hasNumber", label: "Number", met: strength.requirements.hasNumber },
    { key: "hasSpecial", label: "Special (!@#$...)", met: strength.requirements.hasSpecial },
  ]

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">Password Strength</span>
          <span className={cn("text-xs uppercase tracking-wider font-display font-bold", currentColor.text)}>
            {strength.level}
          </span>
        </div>
        <div className="h-1.5 bg-cyber-panel rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              currentColor.bar,
              currentColor.glow,
              animate && "animate-pulse",
            )}
            style={{ width: currentColor.width }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {requirements.map((req) => (
          <div
            key={req.key}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-all duration-300",
              req.met ? "text-cyber-green" : "text-muted-foreground",
            )}
          >
            {req.met ? (
              <Check size={12} className="text-cyber-green" />
            ) : (
              <X size={12} className="text-muted-foreground" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
