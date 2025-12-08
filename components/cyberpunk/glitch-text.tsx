"use client"

import { cn } from "@/lib/utils"

interface GlitchTextProps {
  children: string
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
  glow?: "cyan" | "magenta" | "green" | "red"
}

export function GlitchText({ children, className, as: Tag = "span", glow = "cyan" }: GlitchTextProps) {
  const glowClasses = {
    cyan: "text-glow-cyan",
    magenta: "text-glow-magenta",
    green: "text-glow-green",
    red: "text-glow-red",
  }

  return (
    <Tag
      className={cn(
        "font-display uppercase tracking-wider relative",
        glowClasses[glow],
        "hover:glitch-text transition-all duration-300",
        className,
      )}
      data-text={children}
    >
      {children}
    </Tag>
  )
}
