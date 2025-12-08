"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LogOut, User, Shield, UserCog, HelpCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { StatusBadge } from "@/components/cyberpunk/status-badge"
import { SidebarWrapper, useSidebar } from "@/components/cyberpunk/sidebar-wrapper"

interface UserSidebarProps {
  username: string
  userLevel: "admin" | "regular"
  passwordExpiresAt?: string
}

function UserSidebarContent({ username, userLevel, passwordExpiresAt }: UserSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, isTablet, setIsOpen, isMobile } = useSidebar()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const getPasswordExpiryStatus = () => {
    if (!passwordExpiresAt) return null
    const expiryDate = new Date(passwordExpiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry <= 0) return { status: "expired", days: 0, color: "text-cyber-red" }
    if (daysUntilExpiry <= 7) return { status: "warning", days: daysUntilExpiry, color: "text-cyber-yellow" }
    if (daysUntilExpiry <= 30) return { status: "notice", days: daysUntilExpiry, color: "text-cyber-cyan" }
    return { status: "ok", days: daysUntilExpiry, color: "text-cyber-green" }
  }

  const passwordExpiry = getPasswordExpiryStatus()

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      description: "Your account overview",
      color: "cyan",
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: UserCog,
      href: "/dashboard/settings",
      description: "Manage your profile",
      color: "magenta",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      href: "/dashboard/help",
      description: "Get assistance",
      color: "yellow",
    },
  ]

  const showCollapsed = isTablet && isCollapsed

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { active: string; hover: string; text: string }> = {
      cyan: {
        active: "bg-cyber-cyan/20 border-cyber-cyan/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]",
        hover: "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30",
        text: "text-cyber-cyan",
      },
      magenta: {
        active: "bg-cyber-magenta/20 border-cyber-magenta/50 shadow-[0_0_15px_rgba(255,0,255,0.2)]",
        hover: "hover:bg-cyber-magenta/10 hover:border-cyber-magenta/30",
        text: "text-cyber-magenta",
      },
      yellow: {
        active: "bg-cyber-yellow/20 border-cyber-yellow/50 shadow-[0_0_15px_rgba(255,255,0,0.2)]",
        hover: "hover:bg-cyber-yellow/10 hover:border-cyber-yellow/30",
        text: "text-cyber-yellow",
      },
    }
    const c = colors[color] || colors.cyan
    return isActive ? `${c.active} ${c.text}` : `${c.hover} border-transparent`
  }

  return (
    <aside className="h-full w-full glass-panel border-r border-cyber-cyan/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className={cn("border-b border-cyber-cyan/20 shrink-0", showCollapsed ? "p-2" : "p-4 lg:p-6")}>
        <div className={cn("flex items-center", showCollapsed ? "justify-center" : "gap-3")}>
          <div className="relative">
            <User className="text-cyber-cyan" size={showCollapsed ? 24 : 28} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-green rounded-full animate-pulse" />
          </div>
          {!showCollapsed && (
            <div>
              <GlitchText as="h1" className="text-lg lg:text-xl" glow="cyan">
                USER PORTAL
              </GlitchText>
              <p className="text-[10px] lg:text-xs text-muted-foreground font-mono">ACCESS TERMINAL v2.0</p>
            </div>
          )}
        </div>
      </div>

      {/* Password Expiry Warning */}
      {!showCollapsed && passwordExpiry && passwordExpiry.status !== "ok" && (
        <div
          className={cn(
            "mx-3 lg:mx-4 mt-3 lg:mt-4 p-2 lg:p-3 rounded-sm border",
            passwordExpiry.status === "expired"
              ? "bg-cyber-red/10 border-cyber-red/30"
              : passwordExpiry.status === "warning"
                ? "bg-cyber-yellow/10 border-cyber-yellow/30"
                : "bg-cyber-cyan/10 border-cyber-cyan/30",
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={12} className={cn(passwordExpiry.color, "shrink-0")} />
            <span className={cn("text-[10px] lg:text-xs font-mono", passwordExpiry.color)}>
              {passwordExpiry.status === "expired" ? "PASSWORD EXPIRED" : `EXPIRES IN ${passwordExpiry.days} DAYS`}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 space-y-1.5 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyber-cyan/20",
          showCollapsed ? "p-2" : "p-3 lg:p-4",
        )}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          if (showCollapsed) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center justify-center w-12 h-12 mx-auto rounded-sm transition-all duration-300",
                  "border group relative active:scale-95 touch-manipulation",
                  getColorClasses(item.color, isActive),
                )}
                title={item.label}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? item.color === "cyan"
                        ? "text-cyber-cyan"
                        : item.color === "magenta"
                          ? "text-cyber-magenta"
                          : "text-cyber-yellow"
                      : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-full ml-2 px-2 py-1 bg-cyber-black border rounded-sm text-xs whitespace-nowrap",
                    "opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50",
                    item.color === "cyan" && "text-cyber-cyan border-cyber-cyan/30",
                    item.color === "magenta" && "text-cyber-magenta border-cyber-magenta/30",
                    item.color === "yellow" && "text-cyber-yellow border-cyber-yellow/30",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-3 rounded-sm transition-all duration-300",
                "border min-h-[56px] group active:scale-[0.98] touch-manipulation",
                getColorClasses(item.color, isActive),
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "transition-colors shrink-0",
                  isActive
                    ? item.color === "cyan"
                      ? "text-cyber-cyan"
                      : item.color === "magenta"
                        ? "text-cyber-magenta"
                        : "text-cyber-yellow"
                    : "text-muted-foreground",
                )}
              />
              <div className="text-left min-w-0 flex-1">
                <span
                  className={cn(
                    "text-sm uppercase tracking-wider font-display block",
                    isActive
                      ? item.color === "cyan"
                        ? "text-cyber-cyan"
                        : item.color === "magenta"
                          ? "text-cyber-magenta"
                          : "text-cyber-yellow"
                      : "text-foreground",
                  )}
                >
                  {item.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono truncate block">{item.description}</span>
              </div>
              {isActive && (
                <span
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse shrink-0",
                    item.color === "cyan" && "bg-cyber-cyan",
                    item.color === "magenta" && "bg-cyber-magenta",
                    item.color === "yellow" && "bg-cyber-yellow",
                  )}
                />
              )}
            </Link>
          )
        })}

        {/* Admin Panel Link (for admin users) */}
        {userLevel === "admin" && !showCollapsed && (
          <div className="pt-3 mt-3 border-t border-cyber-magenta/20">
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-sm transition-all duration-300",
                "bg-cyber-magenta/10 hover:bg-cyber-magenta/20 border border-cyber-magenta/30 hover:border-cyber-magenta/50",
                "text-cyber-magenta group min-h-[56px] active:scale-[0.98] touch-manipulation",
              )}
            >
              <Shield size={20} className="group-hover:animate-pulse shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-sm uppercase tracking-wider font-display block">Admin Panel</span>
                <span className="text-[10px] text-cyber-magenta/70 font-mono block">System Control Access</span>
              </div>
            </Link>
          </div>
        )}

        {userLevel === "admin" && showCollapsed && (
          <div className="pt-2 mt-2 border-t border-cyber-magenta/20">
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center justify-center w-12 h-12 mx-auto rounded-sm transition-all duration-300",
                "bg-cyber-magenta/10 hover:bg-cyber-magenta/20 border border-cyber-magenta/30",
                "text-cyber-magenta group relative active:scale-95 touch-manipulation",
              )}
              title="Admin Panel"
            >
              <Shield size={20} className="group-hover:animate-pulse" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-cyber-black border border-cyber-magenta/30 rounded-sm text-xs text-cyber-magenta whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Admin Panel
              </span>
            </Link>
          </div>
        )}
      </nav>

      <div
        className={cn("border-t border-cyber-cyan/20 shrink-0 bg-cyber-black/90", showCollapsed ? "p-2" : "p-3 lg:p-4")}
      >
        {!showCollapsed && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider">Connected as</p>
            </div>
            <p className="text-sm text-cyber-cyan font-display truncate">{username}</p>
            <div className="mt-2">
              <StatusBadge status={userLevel} />
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full rounded-sm transition-all duration-300",
            "text-cyber-red bg-cyber-red/10 hover:bg-cyber-red/20 active:bg-cyber-red/30",
            "border border-cyber-red/40 hover:border-cyber-red/60",
            "group min-h-[48px] touch-manipulation active:scale-[0.98]",
            showCollapsed ? "justify-center p-2" : "px-3 py-2.5",
          )}
          title={showCollapsed ? "Disconnect" : undefined}
        >
          <LogOut size={18} className="group-hover:animate-pulse shrink-0" />
          {!showCollapsed && <span className="text-sm uppercase tracking-wider font-display">Disconnect</span>}
        </button>
      </div>
    </aside>
  )
}

export function UserSidebar({ username, userLevel, passwordExpiresAt }: UserSidebarProps) {
  return (
    <SidebarWrapper>
      <UserSidebarContent username={username} userLevel={userLevel} passwordExpiresAt={passwordExpiresAt} />
    </SidebarWrapper>
  )
}
