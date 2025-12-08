import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { Settings, Shield, Clock, Key, Lock, AlertTriangle } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <GlitchText as="h1" className="text-2xl mb-2" glow="cyan">
          SYSTEM SETTINGS
        </GlitchText>
        <p className="text-muted-foreground text-sm">Configure security policies and system parameters</p>
      </div>

      {/* Security Policies */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-cyber-cyan" size={20} />
          <GlitchText as="h2" className="text-lg" glow="cyan">
            SECURITY POLICIES
          </GlitchText>
        </div>

        <div className="grid gap-6">
          {/* Lockout Threshold */}
          <div className="flex items-start justify-between p-4 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
            <div className="flex items-start gap-4">
              <Lock className="text-cyber-red mt-1" size={20} />
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-cyber-cyan">Lockout Threshold</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Number of failed login attempts before account lockout
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-display text-cyber-red">3</span>
              <p className="text-xs text-muted-foreground">attempts</p>
            </div>
          </div>

          {/* Password Complexity */}
          <div className="flex items-start justify-between p-4 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
            <div className="flex items-start gap-4">
              <Key className="text-cyber-magenta mt-1" size={20} />
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-cyber-cyan">Password Complexity</h3>
                <p className="text-xs text-muted-foreground mt-1">Minimum requirements for user passwords</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 text-xs bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm text-cyber-cyan">
                    8+ chars
                  </span>
                  <span className="px-2 py-1 text-xs bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm text-cyber-cyan">
                    Uppercase
                  </span>
                  <span className="px-2 py-1 text-xs bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm text-cyber-cyan">
                    Lowercase
                  </span>
                  <span className="px-2 py-1 text-xs bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm text-cyber-cyan">
                    Number
                  </span>
                  <span className="px-2 py-1 text-xs bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm text-cyber-cyan">
                    Special char
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-display text-cyber-green">ENABLED</span>
            </div>
          </div>
        </div>
      </CyberPanel>

      {/* Session Configuration */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-cyber-cyan" size={20} />
          <GlitchText as="h2" className="text-lg" glow="cyan">
            SESSION CONFIGURATION
          </GlitchText>
        </div>

        <div className="grid gap-6">
          <div className="flex items-start justify-between p-4 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
            <div className="flex items-start gap-4">
              <Clock className="text-cyber-cyan mt-1" size={20} />
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-cyber-cyan">Session Duration</h3>
                <p className="text-xs text-muted-foreground mt-1">How long user sessions remain valid</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-display text-cyber-cyan">24</span>
              <p className="text-xs text-muted-foreground">hours</p>
            </div>
          </div>
        </div>
      </CyberPanel>

      {/* Password Expiry */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-cyber-yellow" size={20} />
          <GlitchText as="h2" className="text-lg" glow="cyan">
            PASSWORD EXPIRY
          </GlitchText>
        </div>

        <div className="flex items-start justify-between p-4 bg-cyber-black/50 rounded-sm border border-cyber-cyan/10">
          <div className="flex items-start gap-4">
            <Key className="text-cyber-yellow mt-1" size={20} />
            <div>
              <h3 className="font-display text-sm uppercase tracking-wider text-cyber-cyan">Expiry Period</h3>
              <p className="text-xs text-muted-foreground mt-1">Users must change passwords after this period</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-display text-cyber-yellow">90</span>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>
      </CyberPanel>

      {/* Info Notice */}
      <div className="p-4 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-sm">
        <div className="flex items-center gap-2 text-cyber-cyan">
          <Settings size={16} />
          <span className="text-xs font-mono uppercase tracking-wider">System Notice</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          These settings are configured at the database level. Contact your system administrator to modify these values.
        </p>
      </div>
    </div>
  )
}
