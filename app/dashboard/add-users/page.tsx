import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CyberPanel } from '@/components/cyberpunk/cyber-panel'
import { GlitchText } from '@/components/cyberpunk/glitch-text'
import { AlertTriangle, Users } from 'lucide-react'
import { AddUserFormClient } from './add-user-form-client'

export default async function AddUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Check permission
  if (!user.restrictions.can_add_users) {
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
            You do not have permission to add users. If you believe this is an error, please contact your administrator.
          </p>
        </CyberPanel>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="text-cyber-cyan" size={24} />
          <div>
            <GlitchText as="h1" className="text-xl md:text-2xl" glow="cyan">
              ADD NEW USER
            </GlitchText>
            <p className="text-muted-foreground text-xs md:text-sm">Create a new user account</p>
          </div>
        </div>
      </div>

      <CyberPanel>
        <p className="text-sm text-muted-foreground mb-6">
          Use the form below to create a new user account. You can set initial permissions for the new user.
        </p>
        <AddUserFormClient />
      </CyberPanel>
    </div>
  )
}
