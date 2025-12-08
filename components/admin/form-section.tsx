"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  icon?: ReactNode
  color?: "cyan" | "magenta" | "green" | "yellow"
  children: ReactNode
  className?: string
  subtitle?: string
}

const colorClasses = {
  cyan: {
    title: "text-cyber-cyan",
    border: "border-cyber-cyan/20",
    glow: "text-glow-cyan",
  },
  magenta: {
    title: "text-cyber-magenta",
    border: "border-cyber-magenta/20",
    glow: "text-glow-magenta",
  },
  green: {
    title: "text-cyber-green",
    border: "border-cyber-green/20",
    glow: "text-glow-green",
  },
  yellow: {
    title: "text-cyber-yellow",
    border: "border-cyber-yellow/20",
    glow: "text-glow-yellow",
  },
}

export function FormSection({
  title,
  icon,
  color = "cyan",
  children,
  className,
  subtitle,
}: FormSectionProps) {
  const colors = colorClasses[color]

  return (
    <div className={cn("space-y-4 md:space-y-5", className)}>
      {/* Section Header */}
      <div className={cn("border-b pb-3 md:pb-4", colors.border)}>
        <div className="flex items-center gap-2 md:gap-3">
          {icon && (
            <div className={cn("text-lg md:text-xl shrink-0", colors.title)}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-xs md:text-sm uppercase tracking-widest font-display",
                colors.title,
              )}
            >
              {title}
            </h4>
            {subtitle && (
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div>{children}</div>
    </div>
  )
}
