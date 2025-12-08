"use client"

import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function MobileMenuButton({ isOpen, onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "lg:hidden fixed top-4 left-4 z-50 p-3 rounded-sm",
        "bg-cyber-black/90 border border-cyber-cyan/30",
        "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/50",
        "transition-all duration-300",
        "shadow-[0_0_15px_rgba(0,255,255,0.2)]",
        className,
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X size={24} className="text-cyber-cyan" /> : <Menu size={24} className="text-cyber-cyan" />}
    </button>
  )
}
