import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { HelpCircle, Lock, AlertTriangle, Mail, Shield, Key, Clock } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <GlitchText as="h1" className="text-2xl mb-2" glow="cyan">
          HELP CENTER
        </GlitchText>
        <p className="text-muted-foreground text-sm">Support documentation and contact information</p>
      </div>

      {/* Lockout Policy */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-6">
          <Lock className="text-cyber-red" size={20} />
          <GlitchText as="h2" className="text-lg" glow="cyan">
            ACCOUNT LOCKOUT POLICY
          </GlitchText>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-cyber-red/10 border border-cyber-red/30 rounded-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-cyber-red shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-cyber-red mb-2">
                  When Does Lockout Occur?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your account will be automatically locked after{" "}
                  <span className="text-cyber-red font-bold">3 consecutive failed login attempts</span>. This security
                  measure protects your account from unauthorized access attempts.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-cyber-black/50 border border-cyber-cyan/10 rounded-sm">
            <h3 className="font-display text-sm uppercase tracking-wider text-cyber-cyan mb-3">
              What Happens When Locked?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan">•</span>
                You will see the message:{" "}
                <span className="text-cyber-yellow font-mono">"Your account is locked. Contact Admin."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan">•</span>
                All login attempts will be blocked until an Administrator unlocks your account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan">•</span>
                The lockout is logged in the system audit trail for security review
              </li>
            </ul>
          </div>

          <div className="p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-sm">
            <h3 className="font-display text-sm uppercase tracking-wider text-cyber-green mb-3">
              How to Get Unlocked?
            </h3>
            <p className="text-sm text-muted-foreground">
              Contact your system Administrator using the information below. They will verify your identity and unlock
              your account. Once unlocked, your failed attempt counter will be reset to zero.
            </p>
          </div>
        </div>
      </CyberPanel>

      {/* Password Requirements */}
      <CyberPanel>
        <div className="flex items-center gap-3 mb-6">
          <Key className="text-cyber-magenta" size={20} />
          <GlitchText as="h2" className="text-lg" glow="cyan">
            PASSWORD REQUIREMENTS
          </GlitchText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-cyber-black/50 border border-cyber-cyan/10 rounded-sm">
            <h3 className="font-display text-sm uppercase tracking-wider text-cyber-cyan mb-3">Minimum Requirements</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield size={14} className="text-cyber-cyan shrink-0" />
                At least 8 characters long
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield size={14} className="text-cyber-cyan shrink-0" />
                One uppercase letter (A-Z)
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield size={14} className="text-cyber-cyan shrink-0" />
                One lowercase letter (a-z)
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield size={14} className="text-cyber-cyan shrink-0" />
                One number (0-9)
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Shield size={14} className="text-cyber-cyan shrink-0" />
                One special character (!@#$%^&*)
              </li>
            </ul>
          </div>

          <div className="p-4 bg-cyber-black/50 border border-cyber-cyan/10 rounded-sm">
            <h3 className="font-display text-sm uppercase tracking-wider text-cyber-yellow mb-3">Password Expiry</h3>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-cyber-yellow" size={24} />
              <span className="text-2xl font-display text-cyber-yellow">90 Days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Passwords expire every 90 days. You will see a warning when your password is about to expire. Change your
              password before expiry to avoid access issues.
            </p>
          </div>
        </div>
      </CyberPanel>

      {/* Contact Admin - Updated email */}
      <CyberPanel variant="cyan">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="text-cyber-cyan" size={20} />
          <GlitchText as="h2" className="text-lg" glow="cyan">
            CONTACT ADMINISTRATOR
          </GlitchText>
        </div>

        <div className="p-6 bg-cyber-black/50 border border-cyber-cyan/30 rounded-sm text-center">
          <HelpCircle className="text-cyber-cyan mx-auto mb-4" size={48} />
          <h3 className="font-display text-lg text-cyber-cyan mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If your account is locked or you need assistance, please contact your system administrator.
          </p>
          <a
            href="mailto:jayyliteral@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 transition-all"
          >
            <Mail className="text-cyber-cyan" size={16} />
            <span className="text-sm font-mono text-cyber-cyan">jayyliteral@gmail.com</span>
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            Include your username and a description of the issue in your message.
          </p>
        </div>
      </CyberPanel>
    </div>
  )
}
