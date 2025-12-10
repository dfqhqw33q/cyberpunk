import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { adminGetAuditLogs } from "@/lib/admin"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { FileText } from "lucide-react"
import { AuditLogsTable } from "@/components/admin/audit-logs-table"

export default async function AuditLogsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if regular user has can_view_logs permission
  if (session.userLevel === "regular" && !session.restrictions?.can_view_logs) {
    redirect("/admin")
  }

  let logs = []
  try {
    const result = await adminGetAuditLogs(session.userId, undefined, undefined, 500)
    logs = result.logs || []
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    logs = []
  }

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
