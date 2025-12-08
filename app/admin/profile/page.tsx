import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { User, Shield, Key, Clock, Calendar } from "lucide-react"
import { ChangeCredentialsForm } from "@/components/user/change-credentials-form"

export default async function AdminProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const passwordExpiresAt = new Date(user.password_expires_at)
  const daysUntilExpiry = Math.ceil((passwordExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <GlitchText as="h1" className="text-2xl mb-2" glow="magenta">
          ADMIN PROFILE
        </GlitchText>
        <p className="text-muted-foreground text-sm">Manage your administrator account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <CyberPanel>
          <div className="flex items-center gap-3 mb-6">
            <User className="text-cyber-magenta" size={20} />
            <GlitchText as="h2" className="text-lg" glow="magenta">
              PROFILE INFO
            </GlitchText>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-sm bg-cyber-magenta/10 border border-cyber-magenta/30 flex items-center justify-center">
              <Shield className="text-cyber-magenta" size={40} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-cyber-magenta">{user.username}</h3>
              <p className="text-sm text-muted-foreground">Administrator</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                <span className="text-xs text-cyber-green">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
              <div className="flex items-center gap-3">
                <Calendar className="text-cyber-cyan" size={16} />
                <span className="text-sm text-muted-foreground">Member Since</span>
              </div>
              <span className="text-sm font-mono text-cyber-cyan">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
              <div className="flex items-center gap-3">
                <Clock className="text-cyber-cyan" size={16} />
                <span className="text-sm text-muted-foreground">Last Updated</span>
              </div>
              <span className="text-sm font-mono text-cyber-cyan">
                {new Date(user.updated_at).toLocaleDateString()}
              </span>
            </div>

            <div
              className={`flex items-center justify-between p-3 rounded-sm border ${daysUntilExpiry <= 7 ? "bg-cyber-red/10 border-cyber-red/30" : "bg-cyber-black/50 border-cyber-cyan/10"}`}
            >
              <div className="flex items-center gap-3">
                <Key className={daysUntilExpiry <= 7 ? "text-cyber-red" : "text-cyber-cyan"} size={16} />
                <span className="text-sm text-muted-foreground">Password Expires</span>
              </div>
              <span className={`text-sm font-mono ${daysUntilExpiry <= 7 ? "text-cyber-red" : "text-cyber-cyan"}`}>
                {daysUntilExpiry} days
              </span>
            </div>
          </div>
        </CyberPanel>

        {/* Change Credentials */}
        <CyberPanel>
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-cyber-cyan" size={20} />
            <GlitchText as="h2" className="text-lg" glow="cyan">
              CHANGE CREDENTIALS
            </GlitchText>
          </div>

          <ChangeCredentialsForm currentUsername={user.username} />
        </CyberPanel>
      </div>
    </div>
  )
}
