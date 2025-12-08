import { getSession } from "@/lib/auth"
import { adminGetAuditLogs } from "@/lib/admin"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { FileText } from "lucide-react"
import { AuditLogsTable } from "@/components/admin/audit-logs-table"

export default async function AuditLogsPage() {
  const session = await getSession()
  if (!session) return null

  const result = await adminGetAuditLogs(session.userId, undefined, undefined, 500)
  const logs = result.logs || []

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="text-cyber-cyan" size={24} />
        <div>
          <GlitchText as="h1" className="text-xl md:text-2xl" glow="cyan">
            AUDIT LOGS
          </GlitchText>
          <p className="text-muted-foreground text-xs md:text-sm">System activity tracker</p>
        </div>
      </div>

      <CyberPanel className="!p-0 overflow-hidden">
        <AuditLogsTable logs={logs} />
      </CyberPanel>
    </div>
  )
}
