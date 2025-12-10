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
const AUTO_REFRESH_INTERVAL = 30000 // 30 seconds

export default function AdminDashboardClient({ 
  stats: initialStats = { totalUsers: 0, activeUsers: 0, lockedUsers: 0, admins: 0 }, 
  logs: initialLogs = [], 
  username = "User" 
}: AdminDashboardClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(initialStats)
  const [displayLogs, setDisplayLogs] = useState(initialLogs)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const totalPages = Math.ceil((displayLogs?.length || 0) / LOGS_PER_PAGE)
  const startIndex = (currentPage - 1) * LOGS_PER_PAGE
  const currentLogs = (displayLogs || []).slice(startIndex, startIndex + LOGS_PER_PAGE)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Refresh all dashboard data (stats and logs)
  const refreshAllData = useCallback(async (skipLoading = false) => {
    if (!skipLoading) setIsRefreshing(true)
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/logs?limit=50"),
      ])

      const statsData = await statsResponse.json()
      const logsData = await logsResponse.json()

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats)
      }

      if (logsData.success && Array.isArray(logsData.logs)) {
        setDisplayLogs(logsData.logs)
        // Reset to first page when new data is fetched
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error)
    } finally {
      if (!skipLoading) setIsRefreshing(false)
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    refreshAllData(true)
  }, [refreshAllData])

  // Auto-refresh all data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData(true)
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [refreshAllData])

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
      <CyberPanel className="!p-0 overflow-hidden flex flex-col">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-cyber-cyan/20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileText className="text-cyber-cyan shrink-0" size={20} />
            <GlitchText as="h2" className="text-base md:text-lg" glow="cyan">
              RECENT ACTIVITY
            </GlitchText>
          </div>
          <button
            onClick={() => { void refreshAllData() }}
            disabled={isRefreshing}
            className={cn(
              "shrink-0 p-2 w-10 h-10 flex items-center justify-center rounded-sm transition-all",
              "border border-cyber-cyan/20 text-cyber-cyan",
              isRefreshing
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40",
            )}
            title="Refresh all dashboard data"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <div className="px-3 sm:px-4 md:px-6">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-cyber-black border-b border-cyber-cyan/20">
                  <th className="text-left p-2 sm:p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                    User
                  </th>
                  <th className="text-left p-2 sm:p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                    <span className="hidden sm:inline">Action</span>
                    <span className="sm:hidden">Act</span>
                  </th>
                  <th className="text-left p-2 sm:p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black hidden lg:table-cell">
                    Details
                  </th>
                  <th className="text-left p-2 sm:p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log: any) => (
                    <tr key={log.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-colors">
                      <td className="p-2 sm:p-4 text-xs sm:text-sm text-cyber-cyan font-mono">
                        {log.username || "System"}
                      </td>
                      <td className="p-2 sm:p-4">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground max-w-xs hidden lg:table-cell">
                        <span className="block truncate font-mono">{formatDetails(log.details)}</span>
                      </td>
                      <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-cyber-cyan/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-cyber-black/50">
            <div className="text-xs text-muted-foreground font-mono">
              Showing {startIndex + 1}-{Math.min(startIndex + LOGS_PER_PAGE, displayLogs.length)} of {displayLogs.length} entries
            </div>

            <div className="flex items-center gap-1 flex-wrap justify-center">
              {/* First page */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm transition-all",
                  "border border-cyber-cyan/20",
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 active:bg-cyber-cyan/20",
                )}
              >
                <ChevronsLeft size={16} className="text-cyber-cyan" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm transition-all",
                  "border border-cyber-cyan/20",
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 active:bg-cyber-cyan/20",
                )}
              >
                <ChevronLeft size={16} className="text-cyber-cyan" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm transition-all",
                        "border text-sm font-mono",
                        currentPage === pageNum
                          ? "bg-cyber-cyan/20 border-cyber-cyan/50 text-cyber-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                          : "border-cyber-cyan/20 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 text-muted-foreground active:bg-cyber-cyan/20",
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Next page */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm transition-all",
                  "border border-cyber-cyan/20",
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 active:bg-cyber-cyan/20",
                )}
              >
                <ChevronRight size={16} className="text-cyber-cyan" />
              </button>

              {/* Last page */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-sm transition-all",
                  "border border-cyber-cyan/20",
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 active:bg-cyber-cyan/20",
                )}
              >
                <ChevronsRight size={16} className="text-cyber-cyan" />
              </button>
            </div>
          </div>
        )}
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
