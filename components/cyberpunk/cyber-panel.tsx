import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CyberPanelProps {
  children: ReactNode
  className?: string
  variant?: "default" | "magenta" | "red"
  corners?: boolean
  glow?: boolean
}

export function CyberPanel({ children, className, variant = "default", corners = true, glow = true }: CyberPanelProps) {
  const variants = {
    default: "glass-panel",
    magenta: "glass-panel-magenta",
    red: "bg-gradient-to-br from-[rgba(22,22,42,0.9)] to-[rgba(26,26,46,0.8)] backdrop-blur-xl border border-cyber-red/20 shadow-[0_0_20px_rgba(255,7,58,0.1),inset_0_0_20px_rgba(255,7,58,0.05)]",
  }

  return (
    <div
      className={cn(
        variants[variant],
        "rounded-sm p-6 relative",
        corners && "cyber-corners",
        glow && "neon-border",
        className,
      )}
    >
      {children}
    </div>
  )
}
