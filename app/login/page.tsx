import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { DataStreamBg } from "@/components/cyberpunk/data-stream-bg"
import { HudGridOverlay } from "@/components/cyberpunk/hud-grid-overlay"
import { AudioControls } from "@/components/cyberpunk/audio-controls"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    if (session.userLevel === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <main className="relative w-screen h-screen flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-cyber-black">
      {/* Animated background */}
      <DataStreamBg />

      <HudGridOverlay intensity="medium" />

      {/* Audio controls */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50">
        <AudioControls />
      </div>

      {/* Login form */}
      <div className="w-full max-w-sm sm:max-w-md px-3 sm:px-4">
        <LoginForm />
      </div>

      {/* Corner decorations */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 text-cyber-cyan/50 text-[10px] sm:text-xs font-mono">
        <div>SYS.AUTH.v2.5</div>
        <div className="text-cyber-magenta/50">NEURAL_LINK::ACTIVE</div>
      </div>
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 text-cyber-cyan/50 text-[10px] sm:text-xs font-mono text-right">
        <div>ENCRYPTION: AES-256</div>
        <div className="text-cyber-green/50">STATUS: OPERATIONAL</div>
      </div>
    </main>
  )
}
