"use client"

import { useState } from "react"
import { Clock, User, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditLog {
  id: string
  created_at: string
  username: string | null
  action: string
  details: any
  ip_address: string | null
}

interface AuditLogsTableProps {
  logs: AuditLog[]
}

const ITEMS_PER_PAGE = 15

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentLogs = logs.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
        <table className="w-full min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-cyber-black border-b border-cyber-cyan/20">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  Timestamp
                </div>
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  User
                </div>
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                Action
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                Details
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap bg-cyber-black">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No audit logs found
                </td>
              </tr>
            ) : (
              currentLogs.map((log) => (
                <tr key={log.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-colors">
                  <td className="p-4 text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="text-cyber-cyan text-sm font-mono">{log.username || "System"}</span>
                  </td>
                  <td className="p-4">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs">
                    <span className="block truncate font-mono">{formatDetails(log.details)}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {log.ip_address || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-cyber-cyan/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-cyber-black/50">
          <div className="text-xs text-muted-foreground font-mono">
            Showing {startIndex + 1}-{Math.min(endIndex, logs.length)} of {logs.length} entries
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
    </div>
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
        "inline-flex items-center px-2 py-1 text-[10px] md:text-xs uppercase tracking-wider rounded-sm border whitespace-nowrap",
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
    return JSON.stringify(details)
  }
}
