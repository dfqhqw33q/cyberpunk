import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { ChangeCredentialsForm } from "@/components/user/change-credentials-form"
import { Settings, User, Key } from "lucide-react"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="text-cyber-cyan" size={28} />
        <div>
          <GlitchText as="h1" className="text-2xl" glow="cyan">
            ACCOUNT SETTINGS
          </GlitchText>
          <p className="text-muted-foreground text-sm">Manage your credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Info */}
        <CyberPanel>
          <div className="flex items-center gap-3 mb-4">
            <User className="text-cyber-cyan" size={20} />
            <h2 className="font-display text-lg uppercase tracking-wider text-cyber-cyan">Current Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Username</p>
              <p className="text-lg font-display text-cyber-cyan">{user.username}</p>
            </div>
            <div className="p-3 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">User Level</p>
              <p className="text-lg font-display capitalize">{user.user_level}</p>
            </div>
            <div className="p-3 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Password Expires</p>
              <p className="text-lg font-display">{new Date(user.password_expires_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CyberPanel>

        {/* Change Credentials */}
        <CyberPanel variant="magenta">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-cyber-magenta" size={20} />
            <h2 className="font-display text-lg uppercase tracking-wider text-cyber-magenta">Change Credentials</h2>
          </div>
          <ChangeCredentialsForm currentUsername={user.username} />
        </CyberPanel>
      </div>
    </div>
  )
}
