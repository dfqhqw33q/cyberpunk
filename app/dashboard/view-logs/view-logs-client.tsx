'use client'

import { useState, useEffect, useCallback } from 'react'
import { CyberPanel } from '@/components/cyberpunk/cyber-panel'
import { CyberButton } from '@/components/cyberpunk/cyber-button'
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  target_user_id?: string
  ip_address: string
  user_agent: string
  details?: string
  created_at: string
}

const LOGS_PER_PAGE = 10

export function ViewLogsClient() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE)
  const startIndex = (currentPage - 1) * LOGS_PER_PAGE
  const currentLogs = logs.slice(startIndex, startIndex + LOGS_PER_PAGE)

  const fetchLogs = useCallback(async (skipLoading = false) => {
    if (!skipLoading) setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/audit-logs')
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to fetch logs')
        return
      }

      setLogs(data.logs || [])
      setCurrentPage(1)
    } catch (err) {
      setError('Failed to fetch logs')
      console.error(err)
    } finally {
      if (!skipLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchLogs(true)
    setIsRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Loading logs...</p>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-cyber-cyan/10 rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-sm bg-cyber-red/10 border border-cyber-red/30">
        <AlertTriangle className="text-cyber-red shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm text-cyber-red font-display">Error Loading Logs</p>
          <p className="text-xs text-cyber-red/70">{error}</p>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No audit logs available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <CyberButton
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="sm"
          variant="secondary"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </CyberButton>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b border-cyber-cyan/20">
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase">Time</th>
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase">Action</th>
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase hidden md:table-cell">Details</th>
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase hidden lg:table-cell">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log, index) => (
              <tr
                key={log.id}
                className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-colors"
              >
                <td className="p-2 md:p-3 text-xs">{formatDate(log.created_at)}</td>
                <td className="p-2 md:p-3">
                  <span className="px-2 py-1 rounded-sm bg-cyber-cyan/10 text-cyber-cyan text-[10px] md:text-xs font-display uppercase">
                    {formatAction(log.action)}
                  </span>
                </td>
                <td className="p-2 md:p-3 text-muted-foreground hidden md:table-cell truncate">
                  {log.details || '-'}
                </td>
                <td className="p-2 md:p-3 text-muted-foreground hidden lg:table-cell text-[10px] font-mono truncate">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages} ({logs.length} total logs)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-sm border border-cyber-cyan/30 hover:border-cyber-cyan/50 disabled:opacity-50 transition-colors"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-sm border border-cyber-cyan/30 hover:border-cyber-cyan/50 disabled:opacity-50 transition-colors"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
