'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { CyberPanel } from '@/components/cyberpunk/cyber-panel'
import { GlitchText } from '@/components/cyberpunk/glitch-text'
import { AlertTriangle, FileText } from 'lucide-react'
import { ViewLogsClient } from './view-logs-client'
import { useSession } from '@/lib/hooks/use-session'

export default function ViewLogsPage() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  if (!user) {
    redirect('/login')
  }

  // Check permission
  if (!user.restrictions.can_view_logs) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-cyber-red" size={24} />
          <GlitchText as="h1" className="text-xl md:text-2xl" glow="red">
            ACCESS DENIED
          </GlitchText>
        </div>
        <CyberPanel variant="red">
          <p className="text-muted-foreground">
            You do not have permission to view logs. If you believe this is an error, please contact your administrator.
          </p>
        </CyberPanel>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-cyber-cyan" size={24} />
          <div>
            <GlitchText as="h1" className="text-xl md:text-2xl" glow="cyan">
              AUDIT LOGS
            </GlitchText>
            <p className="text-muted-foreground text-xs md:text-sm">System activity and security logs</p>
          </div>
        </div>
      </div>

      <CyberPanel>
        <ViewLogsClient />
      </CyberPanel>
    </div>
  )
}
