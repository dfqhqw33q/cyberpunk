"use client"

import type React from "react"

import { useState } from "react"
import { CyberInput } from "@/components/cyberpunk/cyber-input"
import { CyberButton } from "@/components/cyberpunk/cyber-button"
import { PasswordStrengthMeter } from "@/components/cyberpunk/password-strength"
import { Lock } from "lucide-react"
import type { AppUser } from "@/lib/auth"

interface ResetPasswordFormProps {
  user: AppUser
  onSuccess: () => void
}

export function ResetPasswordForm({ user, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-sm mb-4">
        <p className="text-sm">
          Resetting password for: <span className="text-cyber-cyan font-display">{user.username}</span>
        </p>
      </div>

      <CyberInput
        label="New Password"
        icon={<Lock size={18} />}
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <PasswordStrengthMeter password={newPassword} />

      <CyberInput
        label="Confirm Password"
        icon={<Lock size={18} />}
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        error={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : ""}
      />

      {error && (
        <div className="p-3 bg-cyber-red/10 border border-cyber-red/30 rounded-sm">
          <p className="text-sm text-cyber-red font-alert">{error}</p>
        </div>
      )}

      <CyberButton type="submit" className="w-full" variant="secondary" loading={loading}>
        Reset Password
      </CyberButton>
    </form>
  )
}
