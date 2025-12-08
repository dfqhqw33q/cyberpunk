"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface HudGridOverlayProps {
  className?: string
  showScanlines?: boolean
  showGrid?: boolean
  showKineticLines?: boolean
  intensity?: "low" | "medium" | "high"
}

export function HudGridOverlay({
  className,
  showScanlines = true,
  showGrid = true,
  showKineticLines = true,
  intensity = "medium",
}: HudGridOverlayProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const opacityMap = {
    low: "opacity-5",
    medium: "opacity-10",
    high: "opacity-20",
  }

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-[1]", className)}>
      {/* Grid pattern */}
      {showGrid && (
        <div
          className={cn("absolute inset-0", opacityMap[intensity])}
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      )}

      {/* Scanlines */}
      {showScanlines && (
        <div
          className={cn("absolute inset-0", reducedMotion ? "opacity-5" : opacityMap[intensity])}
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.3) 2px,
              rgba(0, 0, 0, 0.3) 4px
            )`,
          }}
        />
      )}

      {/* Kinetic lines (animated horizontal lines) */}
      {showKineticLines && !reducedMotion && (
        <>
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent animate-kinetic-line-1" />
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-magenta/20 to-transparent animate-kinetic-line-2" />
        </>
      )}

      {/* Corner HUD elements */}
      <div className="absolute top-4 left-4">
        <svg width="60" height="60" className="text-cyber-cyan/30">
          <path d="M0 20 L0 0 L20 0" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="10" r="2" fill="currentColor" className={!reducedMotion ? "animate-pulse" : ""} />
        </svg>
      </div>
      <div className="absolute top-4 right-4">
        <svg width="60" height="60" className="text-cyber-cyan/30 rotate-90">
          <path d="M0 20 L0 0 L20 0" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="10" r="2" fill="currentColor" className={!reducedMotion ? "animate-pulse" : ""} />
        </svg>
      </div>
      <div className="absolute bottom-4 left-4">
        <svg width="60" height="60" className="text-cyber-cyan/30 -rotate-90">
          <path d="M0 20 L0 0 L20 0" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="10" r="2" fill="currentColor" className={!reducedMotion ? "animate-pulse" : ""} />
        </svg>
      </div>
      <div className="absolute bottom-4 right-4">
        <svg width="60" height="60" className="text-cyber-cyan/30 rotate-180">
          <path d="M0 20 L0 0 L20 0" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="10" r="2" fill="currentColor" className={!reducedMotion ? "animate-pulse" : ""} />
        </svg>
      </div>
    </div>
  )
}
