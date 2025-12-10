"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Terminal } from "lucide-react"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { CyberInput } from "@/components/cyberpunk/cyber-input"
import { CyberButton } from "@/components/cyberpunk/cyber-button"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { HudOverlay } from "@/components/cyberpunk/hud-overlay"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLockout, setShowLockout] = useState(false)
  const [lockoutMessage, setLockoutMessage] = useState("")
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setAttemptsRemaining(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        // Redirect based on user level
        if (data.user.user_level === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      } else {
        if (data.code === "ACCOUNT_LOCKED") {
          setLockoutMessage(data.error)
          setShowLockout(true)
        } else if (data.code === "PASSWORD_EXPIRED") {
          setError("Your password has expired. Contact Admin to reset.")
        } else {
          setError(data.error || "Authentication failed")
          if (data.attemptsRemaining !== undefined) {
            setAttemptsRemaining(data.attemptsRemaining)
          }
        }
      }
    } catch {
      setError("Network error. Check connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CyberPanel className="w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-cyber-cyan/20">
          <Terminal className="text-cyber-cyan" size={24} />
          <div>
            <GlitchText as="h1" className="text-xl" glow="cyan">
              CYBERAUTH
            </GlitchText>
            <p className="text-xs text-muted-foreground mt-1">Secure Access Terminal v2.5</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <CyberInput
            label="Username"
            icon={<User size={18} />}
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <CyberInput
            label="Password"
            icon={<Lock size={18} />}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 bg-cyber-red/10 border border-cyber-red/30 rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm text-cyber-red font-alert">{error}</p>
              {attemptsRemaining !== null && (
                <p className="text-xs text-cyber-yellow mt-1">
                  Warning: {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining before lockout
                </p>
              )}
            </div>
          )}

          <CyberButton type="submit" className="w-full" loading={loading}>
            {loading ? "Authenticating..." : "Initialize Access"}
          </CyberButton>
        </form>

        {/* System status */}
        <div className="mt-6 pt-4 border-t border-cyber-cyan/20">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-cyber-green animate-pulse mr-1" />
              System Online
            </span>
            <span className="text-cyber-cyan/50">v2.5.0-stable</span>
          </div>
        </div>
      </CyberPanel>

      {/* Lockout overlay */}
      <HudOverlay type="lockout" message={lockoutMessage} visible={showLockout} onClose={() => setShowLockout(false)} />
    </>
  )
}
