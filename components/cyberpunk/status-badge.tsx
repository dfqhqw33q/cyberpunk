import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "active" | "inactive" | "locked" | "admin" | "regular"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    active: {
      label: "Active",
      color: "text-cyber-green border-cyber-green bg-cyber-green/10",
      glow: "shadow-[0_0_8px_rgba(0,255,65,0.3)]",
    },
    inactive: {
      label: "Inactive",
      color: "text-muted-foreground border-muted-foreground bg-muted-foreground/10",
      glow: "",
    },
    locked: {
      label: "Locked",
      color: "text-cyber-red border-cyber-red bg-cyber-red/10",
      glow: "shadow-[0_0_8px_rgba(255,7,58,0.3)]",
    },
    admin: {
      label: "Admin",
      color: "text-cyber-magenta border-cyber-magenta bg-cyber-magenta/10",
      glow: "shadow-[0_0_8px_rgba(255,0,255,0.3)]",
    },
    regular: {
      label: "User",
      color: "text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10",
      glow: "shadow-[0_0_8px_rgba(0,255,255,0.3)]",
    },
  }

  const config = configs[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs uppercase tracking-wider font-display",
        "border rounded-sm",
        config.color,
        config.glow,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  )
}
