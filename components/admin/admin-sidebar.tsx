"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Users, FileText, Shield, LogOut, Home, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { SidebarWrapper, useSidebar } from "@/components/cyberpunk/sidebar-wrapper"

interface AdminSidebarProps {
  username: string
  userLevel: "admin" | "regular"
  permissions?: {
    can_add_users?: boolean
    can_edit_users?: boolean
    can_view_logs?: boolean
    can_manage_roles?: boolean
  }
}

function AdminSidebarContent({ username, userLevel, permissions = {} }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, isTablet, setIsOpen, isMobile } = useSidebar()
  const isRegularUser = userLevel === "regular"

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

  const navSections = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/admin",
      description: "System status & quick actions",
      color: "cyan",
      requiredPermission: undefined, // Always visible
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      href: "/admin/users",
      description: "Manage all system users",
      color: "cyan",
      requiredPermission: "can_edit_users" as const,
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: FileText,
      href: "/admin/audit-logs",
      description: "System activity tracking",
      color: "yellow",
      requiredPermission: "can_view_logs" as const,
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      href: "/admin/settings",
      description: "Security configuration",
      color: "magenta",
      requiredPermission: "can_manage_roles" as const,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      href: "/admin/profile",
      description: "Admin account settings",
      color: "green",
      requiredPermission: undefined, // Always visible
    },
  ]

  // Filter navigation items based on permissions
  const visibleSections = navSections.filter((section) => {
    // Admins see everything
    if (!isRegularUser) return true
    // Regular users only see items they have permission for or no permission required
    if (!section.requiredPermission) return true
    return permissions[section.requiredPermission]
  })

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
      green: {
        active: "bg-cyber-green/20 border-cyber-green/50 shadow-[0_0_15px_rgba(0,255,65,0.2)]",
        hover: "hover:bg-cyber-green/10 hover:border-cyber-green/30",
        text: "text-cyber-green",
      },
    }
    const c = colors[color] || colors.cyan
    return isActive ? `${c.active} ${c.text}` : `${c.hover} border-transparent`
  }

  const getIconColor = (color: string, isActive: boolean) => {
    const colors: Record<string, string> = {
      cyan: "text-cyber-cyan",
      magenta: "text-cyber-magenta",
      yellow: "text-cyber-yellow",
      green: "text-cyber-green",
    }
    return isActive ? colors[color] || colors.cyan : "text-muted-foreground"
  }

  return (
    <aside className="h-full w-full glass-panel border-r border-cyber-cyan/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className={cn("border-b border-cyber-cyan/20 shrink-0", showCollapsed ? "p-2" : "p-4 lg:p-6")}>
        <div className={cn("flex items-center", showCollapsed ? "justify-center" : "gap-3")}>
          <div className="relative">
            <Shield className={cn(isRegularUser ? "text-cyber-cyan" : "text-cyber-magenta")} size={showCollapsed ? 24 : 28} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-green rounded-full animate-pulse" />
          </div>
          {!showCollapsed && (
            <div>
              <GlitchText as="h1" className="text-lg lg:text-xl" glow={isRegularUser ? "cyan" : "magenta"}>
                {isRegularUser ? "DELEGATED ADMIN" : "ADMIN PANEL"}
              </GlitchText>
              <p className="text-[10px] lg:text-xs text-muted-foreground font-mono">
                {isRegularUser ? "RESTRICTED ACCESS v2.0" : "SYSTEM CONTROL v2.0"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 space-y-1.5 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyber-cyan/20",
          showCollapsed ? "p-2" : "p-3 lg:p-4",
        )}
      >
        {isRegularUser && visibleSections.length > 0 && (
          <div className="mb-3 p-2 bg-cyber-cyan/5 border border-cyber-cyan/30 rounded-sm">
            <p className="text-[10px] font-mono text-cyber-cyan uppercase tracking-widest">
              📋 Granted Permissions
            </p>
            <p className="text-[9px] text-muted-foreground mt-1">
              You can only access features below
            </p>
          </div>
        )}
        {visibleSections.map((section) => {
          const isActive = pathname === section.href || (section.href !== "/admin" && pathname.startsWith(section.href))

          if (showCollapsed) {
            return (
              <Link
                key={section.id}
                href={section.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center justify-center w-12 h-12 mx-auto rounded-sm transition-all duration-300",
                  "border group relative active:scale-95 touch-manipulation",
                  getColorClasses(section.color, isActive),
                )}
                title={section.label}
              >
                <section.icon size={20} className={cn("transition-colors", getIconColor(section.color, isActive))} />
                <span
                  className={cn(
                    "absolute left-full ml-2 px-2 py-1 bg-cyber-black border rounded-sm text-xs whitespace-nowrap",
                    "opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50",
                    getIconColor(section.color, true),
                    section.color === "cyan" && "border-cyber-cyan/30",
                    section.color === "magenta" && "border-cyber-magenta/30",
                    section.color === "yellow" && "border-cyber-yellow/30",
                    section.color === "green" && "border-cyber-green/30",
                  )}
                >
                  {section.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={section.id}
              href={section.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-3 rounded-sm transition-all duration-300",
                "border min-h-[56px] group active:scale-[0.98] touch-manipulation",
                getColorClasses(section.color, isActive),
              )}
            >
              <section.icon
                size={20}
                className={cn(
                  "transition-colors shrink-0",
                  isActive ? getIconColor(section.color, true) : "text-muted-foreground group-hover:text-cyber-cyan",
                )}
              />
              <div className="text-left min-w-0 flex-1">
                <span
                  className={cn(
                    "text-sm uppercase tracking-wider font-display block transition-colors",
                    isActive ? getIconColor(section.color, true) : "text-foreground",
                  )}
                >
                  {section.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono truncate block">
                  {section.description}
                </span>
              </div>
              {isActive && (
                <span
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse shrink-0",
                    section.color === "cyan" && "bg-cyber-cyan",
                    section.color === "magenta" && "bg-cyber-magenta",
                    section.color === "yellow" && "bg-cyber-yellow",
                    section.color === "green" && "bg-cyber-green",
                  )}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div
        className={cn("border-t border-cyber-cyan/20 shrink-0 bg-cyber-black/90", showCollapsed ? "p-2" : "p-3 lg:p-4")}
      >
        {!showCollapsed && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider">Online as</p>
            </div>
            <p className="text-sm text-cyber-cyan font-display truncate">{username}</p>
            <p className={cn("text-[10px] font-mono mt-1", isRegularUser ? "text-cyber-yellow" : "text-cyber-magenta")}>
              {isRegularUser ? "LIMITED PRIVILEGES" : "ADMIN PRIVILEGES"}
            </p>
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

export function AdminSidebar({ username, userLevel, permissions }: AdminSidebarProps) {
  return (
    <SidebarWrapper>
      <AdminSidebarContent username={username} userLevel={userLevel} permissions={permissions} />
    </SidebarWrapper>
  )
}
