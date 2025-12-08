"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from "lucide-react"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { cn } from "@/lib/utils"

interface AdminDashboardClientProps {
  stats?: {
    totalUsers: number
    activeUsers: number
    lockedUsers: number
    admins: number
  }
  logs?: any[]
  username?: string
}

const LOGS_PER_PAGE = 5

export default function AdminDashboardClient({ 
  stats = { totalUsers: 0, activeUsers: 0, lockedUsers: 0, admins: 0 }, 
  logs = [], 
  username = "User" 
}: AdminDashboardClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [displayLogs, setDisplayLogs] = useState(logs)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const totalPages = Math.ceil((displayLogs?.length || 0) / LOGS_PER_PAGE)
  const startIndex = (currentPage - 1) * LOGS_PER_PAGE
  const currentLogs = (displayLogs || []).slice(startIndex, startIndex + LOGS_PER_PAGE)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Real-time refresh functionality
  const refreshLogs = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/logs?limit=50")
      const data = await response.json()
      if (data.success && Array.isArray(data.logs)) {
        setDisplayLogs(data.logs)
        // Reset to first page when new data is fetched
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Failed to refresh logs:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLogs()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshLogs])

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <GlitchText as="h1" className="text-xl md:text-2xl mb-2" glow="cyan">
            SYSTEM OVERVIEW
          </GlitchText>
          <p className="text-muted-foreground text-xs md:text-sm">Welcome back, {username}</p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-cyber-green">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<Users size={20} className="md:w-6 md:h-6" />}
          label="Total Users"
          value={stats.totalUsers}
          color="cyan"
        />
        <StatCard
          icon={<Shield size={20} className="md:w-6 md:h-6" />}
          label="Active Users"
          value={stats.activeUsers}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="md:w-6 md:h-6" />}
          label="Locked Accounts"
          value={stats.lockedUsers}
          color="red"
        />
        <StatCard
          icon={<Shield size={20} className="md:w-6 md:h-6" />}
          label="Administrators"
          value={stats.admins}
          color="magenta"
        />
      </div>

      {/* Recent Activity with Scrollable Table and Pagination */}
      <CyberPanel className="p-0! overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-cyber-cyan/20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileText className="text-cyber-cyan shrink-0" size={20} />
            <GlitchText as="h2" className="text-base md:text-lg" glow="cyan">
              RECENT ACTIVITY
            </GlitchText>
          </div>
          <button
            onClick={refreshLogs}
            disabled={isRefreshing}
            className={cn(
              "shrink-0 p-2 w-10 h-10 flex items-center justify-center rounded-sm transition-all",
              "border border-cyber-cyan/20 text-cyber-cyan",
              isRefreshing
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40",
            )}
            title="Refresh activity logs"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
            {(displayLogs?.length || 0)} entries
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-hidden max-h-[50vh]">
          <div className="px-3 sm:px-4 md:px-6 min-w-full">
            {/* Sticky Header */}
            <div className="grid grid-cols-[1fr_100px_1fr_120px] gap-2 sm:gap-4 p-3 bg-cyber-black/70 border-b border-cyber-cyan/20 sticky top-0 z-10">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display min-w-0">User</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap">Action</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display hidden sm:block min-w-0">Details</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display text-right whitespace-nowrap">
                Time
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-cyber-cyan/10">
              {currentLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>
              ) : (
                currentLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="grid grid-cols-[1fr_100px_1fr_120px] gap-2 sm:gap-4 p-3 hover:bg-cyber-cyan/5 transition-colors items-center"
                  >
                    <div className="text-xs sm:text-sm font-mono text-cyber-cyan truncate">{log.username || "System"}</div>
                    <div className="flex justify-center">
                      <ActionBadge action={log.action} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate hidden sm:block">{formatDetails(log.details)}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-mono text-right whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CyberPanel>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: "cyan" | "green" | "red" | "magenta"
}) {
  const colors = {
    cyan: "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5",
    green: "text-cyber-green border-cyber-green/30 bg-cyber-green/5",
    red: "text-cyber-red border-cyber-red/30 bg-cyber-red/5",
    magenta: "text-cyber-magenta border-cyber-magenta/30 bg-cyber-magenta/5",
  }

  return (
    <CyberPanel className="!p-3 md:!p-4">
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`p-2 md:p-3 rounded-sm border ${colors[color]}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider truncate">{label}</p>
          <p className={`text-xl md:text-2xl font-display ${colors[color].split(" ")[0]}`}>{value}</p>
        </div>
      </div>
    </CyberPanel>
  )
}

function ActionBadge({ action }: { action: string }) {
  const configs: Record<string, { color: string; bg: string; border: string }> = {
    login_success: { color: "text-cyber-green", bg: "bg-cyber-green/10", border: "border-cyber-green/30" },
    login_failed: { color: "text-cyber-red", bg: "bg-cyber-red/10", border: "border-cyber-red/30" },
    account_locked: { color: "text-cyber-red", bg: "bg-cyber-red/10", border: "border-cyber-red/30" },
    account_unlocked: { color: "text-cyber-green", bg: "bg-cyber-green/10", border: "border-cyber-green/30" },
    user_created: { color: "text-cyber-cyan", bg: "bg-cyber-cyan/10", border: "border-cyber-cyan/30" },
    user_updated: { color: "text-cyber-yellow", bg: "bg-cyber-yellow/10", border: "border-cyber-yellow/30" },
    password_reset: { color: "text-cyber-magenta", bg: "bg-cyber-magenta/10", border: "border-cyber-magenta/30" },
    password_changed: { color: "text-cyber-magenta", bg: "bg-cyber-magenta/10", border: "border-cyber-magenta/30" },
    user_activated: { color: "text-cyber-green", bg: "bg-cyber-green/10", border: "border-cyber-green/30" },
    user_deactivated: { color: "text-cyber-red", bg: "bg-cyber-red/10", border: "border-cyber-red/30" },
    credentials_changed: { color: "text-cyber-cyan", bg: "bg-cyber-cyan/10", border: "border-cyber-cyan/30" },
  }

  const config = configs[action] || { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/30" }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm border whitespace-nowrap",
        config.color,
        config.bg,
        config.border,
      )}
    >
      {action.replace(/_/g, " ")}
    </span>
  )
}

function formatDetails(details: any): string {
  if (!details) return "-"
  if (typeof details === "string") return details
  try {
    const entries = Object.entries(details)
    if (entries.length === 0) return "-"
    return entries.map(([k, v]) => `${k}: ${v}`).join(", ")
  } catch {
    return "-"
  }
}
