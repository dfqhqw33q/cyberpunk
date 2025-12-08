"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Lock, ShieldAlert } from "lucide-react"

interface HudOverlayProps {
  type: "lockout" | "error" | "warning"
  message: string
  visible: boolean
  onClose?: () => void
}

export function HudOverlay({ type, message, visible, onClose }: HudOverlayProps) {
  if (!visible) return null

  const configs = {
    lockout: {
      icon: Lock,
      color: "cyber-red",
      borderColor: "border-cyber-red",
      bgColor: "bg-cyber-red/10",
      glowColor: "shadow-[0_0_30px_rgba(255,7,58,0.3)]",
    },
    error: {
      icon: ShieldAlert,
      color: "cyber-red",
      borderColor: "border-cyber-red",
      bgColor: "bg-cyber-red/10",
      glowColor: "shadow-[0_0_30px_rgba(255,7,58,0.3)]",
    },
    warning: {
      icon: AlertTriangle,
      color: "cyber-yellow",
      borderColor: "border-cyber-yellow",
      bgColor: "bg-cyber-yellow/10",
      glowColor: "shadow-[0_0_30px_rgba(255,255,0,0.3)]",
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-cyber-black/80 backdrop-blur-sm",
        "animate-in fade-in duration-300",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative max-w-md w-full p-6 rounded-sm",
          config.bgColor,
          config.borderColor,
          config.glowColor,
          "border-2 animate-[alert-flash_1s_ease-in-out_infinite]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30 animate-[scanline_2s_linear_infinite]" />
        </div>

        {/* HUD corners */}
        <div className={cn("absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2", config.borderColor)} />
        <div className={cn("absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2", config.borderColor)} />
        <div className={cn("absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2", config.borderColor)} />
        <div className={cn("absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2", config.borderColor)} />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={cn(`text-${config.color}`, "animate-pulse")}>
            <Icon size={48} strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h3 className={cn("font-alert text-lg uppercase tracking-wider", `text-${config.color}`)}>
              {type === "lockout" ? "ACCESS DENIED" : type === "error" ? "SYSTEM ERROR" : "WARNING"}
            </h3>
            <p className="text-foreground/80 text-sm">{message}</p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2 text-xs uppercase tracking-wider font-display",
                "border rounded-sm transition-all duration-300",
                config.borderColor,
                `text-${config.color}`,
                `hover:bg-${config.color}/20`,
              )}
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
