"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CyberInput } from "@/components/cyberpunk/cyber-input"
import { CyberButton } from "@/components/cyberpunk/cyber-button"
import { PasswordStrengthMeter } from "@/components/cyberpunk/password-strength"
import { User, Lock, ShieldCheck } from "lucide-react"

interface ChangeCredentialsFormProps {
  currentUsername: string
}

export function ChangeCredentialsForm({ currentUsername }: ChangeCredentialsFormProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword) {
      setError("Current password is required")
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (!newUsername && !newPassword) {
      setError("Please enter a new username or password")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/user/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess("Credentials updated successfully!")
        setCurrentPassword("")
        setNewUsername("")
        setNewPassword("")
        setConfirmPassword("")
        router.refresh()
      } else {
        setError(data.error || "Failed to update credentials")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
      {/* Current Password (required) */}
      <CyberInput
        label="Current Password *"
        icon={<ShieldCheck size={18} />}
        type="password"
        placeholder="Enter current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <div className="border-t border-cyber-magenta/20 pt-4 mt-4">
        <p className="text-[10px] md:text-xs text-muted-foreground mb-4 uppercase tracking-wider">
          Update one or both fields below
        </p>
      </div>

      {/* New Username */}
      <CyberInput
        label="New Username"
        icon={<User size={18} />}
        type="text"
        placeholder={currentUsername}
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
      />

      {/* New Password */}
      <CyberInput
        label="New Password"
        icon={<Lock size={18} />}
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {newPassword && <PasswordStrengthMeter password={newPassword} />}

      {/* Confirm New Password */}
      {newPassword && (
        <CyberInput
          label="Confirm New Password"
          icon={<Lock size={18} />}
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : ""}
        />
      )}

      {error && (
        <div className="p-3 bg-cyber-red/10 border border-cyber-red/30 rounded-sm animate-in fade-in duration-300">
          <p className="text-xs md:text-sm text-cyber-red font-alert">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-sm animate-in fade-in duration-300">
          <p className="text-xs md:text-sm text-cyber-green">{success}</p>
        </div>
      )}

      <CyberButton type="submit" className="w-full" variant="secondary" loading={loading}>
        Update Credentials
      </CyberButton>
    </form>
  )
}
