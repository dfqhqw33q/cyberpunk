import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { User, Shield, Clock, Key, Users, FileText, Lock, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function UserDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const passwordExpiresAt = new Date(user.password_expires_at)
  const daysUntilExpiry = Math.ceil((passwordExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <GlitchText as="h1" className="text-xl md:text-2xl mb-2" glow="cyan">
            {`WELCOME, ${user.username.toUpperCase()}`}
          </GlitchText>
          <p className="text-muted-foreground text-xs md:text-sm">Your personal access terminal</p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-cyber-green">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          Access Granted
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Profile Card */}
        <CyberPanel className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-sm bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center shrink-0">
              <User className="text-cyber-cyan" size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-base md:text-lg text-cyber-cyan truncate">{user.username}</h2>
              <p className="text-xs md:text-sm text-muted-foreground capitalize">{user.user_level} User</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Member Since</p>
                  <p className="text-xs md:text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <p className="text-xs md:text-sm text-cyber-green">Active</p>
                </div>
              </div>
            </div>
          </div>
        </CyberPanel>

        {/* Password Expiry Card */}
        <CyberPanel variant={daysUntilExpiry <= 7 ? "red" : "default"}>
          <div className="flex items-center gap-3 mb-3">
            <Key className={daysUntilExpiry <= 7 ? "text-cyber-red" : "text-cyber-cyan"} size={18} />
            <h3 className="font-display text-xs md:text-sm uppercase tracking-wider">Password Status</h3>
          </div>
          <p
            className={`text-xl md:text-2xl font-display ${daysUntilExpiry <= 7 ? "text-cyber-red" : "text-cyber-cyan"}`}
          >
            {daysUntilExpiry} Days
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Until password expires</p>
          {daysUntilExpiry <= 7 && (
            <p className="text-[10px] md:text-xs text-cyber-yellow mt-2 animate-pulse">Change your password soon!</p>
          )}
        </CyberPanel>
      </div>

      {/* Permissions */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-cyber-cyan" size={18} />
          <GlitchText as="h2" className="text-base md:text-lg" glow="cyan">
            ACCESS PERMISSIONS
          </GlitchText>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {Object.entries(user.restrictions).map(([key, value]) => (
            <div
              key={key}
              className={cn(
                "p-2 md:p-3 rounded-sm border transition-colors",
                value
                  ? "bg-cyber-green/10 border-cyber-green/30 text-cyber-green"
                  : "bg-cyber-black/50 border-cyber-cyan/10 text-muted-foreground",
              )}
            >
              <p className="text-[10px] md:text-xs uppercase tracking-wider truncate">{formatPermission(key)}</p>
              <p className="text-xs md:text-sm font-display mt-1">{value ? "Granted" : "Denied"}</p>
            </div>
          ))}
        </div>
      </CyberPanel>

      {/* Restricted Admin Actions (if user has permissions) */}
      {Object.values(user.restrictions).some((v) => v) && (
        <CyberPanel>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-cyber-green" size={18} />
            <GlitchText as="h2" className="text-base md:text-lg" glow="green">
              RESTRICTED FEATURES
            </GlitchText>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {user.restrictions.can_add_users && (
              <a
                href="/dashboard/add-users"
                className="flex flex-col items-center gap-2 px-4 py-3 min-h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-sm text-cyber-green hover:bg-cyber-green/20 active:scale-95 transition-all text-center"
              >
                <Users size={16} />
                <span className="text-[10px] md:text-xs font-display uppercase tracking-wider truncate">Add Users</span>
              </a>
            )}
            {user.restrictions.can_edit_users && (
              <a
                href="/dashboard/edit-users"
                className="flex flex-col items-center gap-2 px-4 py-3 min-h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-sm text-cyber-green hover:bg-cyber-green/20 active:scale-95 transition-all text-center"
              >
                <Users size={16} />
                <span className="text-[10px] md:text-xs font-display uppercase tracking-wider truncate">Edit Users</span>
              </a>
            )}
            {user.restrictions.can_view_logs && (
              <a
                href="/dashboard/view-logs"
                className="flex flex-col items-center gap-2 px-4 py-3 min-h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-sm text-cyber-green hover:bg-cyber-green/20 active:scale-95 transition-all text-center"
              >
                <FileText size={16} />
                <span className="text-[10px] md:text-xs font-display uppercase tracking-wider truncate">View Logs</span>
              </a>
            )}
            {user.restrictions.can_manage_roles && (
              <a
                href="/dashboard/manage-roles"
                className="flex flex-col items-center gap-2 px-4 py-3 min-h-12 bg-cyber-green/10 border border-cyber-green/30 rounded-sm text-cyber-green hover:bg-cyber-green/20 active:scale-95 transition-all text-center"
              >
                <Shield size={16} />
                <span className="text-[10px] md:text-xs font-display uppercase tracking-wider truncate">Manage Roles</span>
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            These features allow you to perform specific admin tasks based on your granted permissions. Click on any feature to access it.
          </p>
        </CyberPanel>
      )}

      {/* Quick Actions */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-cyber-cyan" size={18} />
          <GlitchText as="h2" className="text-base md:text-lg" glow="cyan">
            QUICK ACTIONS
          </GlitchText>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-3 min-h-12 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm text-cyber-cyan hover:bg-cyber-cyan/20 active:scale-95 transition-all"
          >
            <Key size={16} />
            <span className="text-xs md:text-sm font-display uppercase tracking-wider">Change Password</span>
          </a>
        </div>
      </CyberPanel>
    </div>
  )
}

function formatPermission(key: string): string {
  return key
    .replace(/^can_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
