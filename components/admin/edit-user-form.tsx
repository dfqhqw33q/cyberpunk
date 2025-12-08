"use client"

import type React from "react"

import { useState } from "react"
import { CyberInput } from "@/components/cyberpunk/cyber-input"
import { CyberButton } from "@/components/cyberpunk/cyber-button"
import { User } from "lucide-react"
import type { AppUser } from "@/lib/auth"

interface EditUserFormProps {
  user: AppUser
  onSuccess: () => void
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [username, setUsername] = useState(user.username)
  const [userLevel, setUserLevel] = useState<"admin" | "regular">(user.user_level)
  const [restrictions, setRestrictions] = useState(user.restrictions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          userLevel,
          restrictions,
        }),
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || "Failed to update user")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <CyberInput
        label="Username"
        icon={<User size={18} />}
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      {/* User Level */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-widest text-cyber-cyan font-display">User Level</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="userLevel"
              value="regular"
              checked={userLevel === "regular"}
              onChange={() => setUserLevel("regular")}
              className="sr-only peer"
            />
            <span className="w-4 h-4 border border-cyber-cyan/50 rounded-sm peer-checked:bg-cyber-cyan peer-checked:border-cyber-cyan transition-colors" />
            <span className="text-sm">Regular User</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="userLevel"
              value="admin"
              checked={userLevel === "admin"}
              onChange={() => setUserLevel("admin")}
              className="sr-only peer"
            />
            <span className="w-4 h-4 border border-cyber-magenta/50 rounded-sm peer-checked:bg-cyber-magenta peer-checked:border-cyber-magenta transition-colors" />
            <span className="text-sm">Administrator</span>
          </label>
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-widest text-cyber-cyan font-display">Permissions</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(restrictions).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer p-2 bg-cyber-black/30 rounded-sm hover:bg-cyber-cyan/5 transition-colors"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setRestrictions({ ...restrictions, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <span className="w-4 h-4 border border-cyber-cyan/50 rounded-sm peer-checked:bg-cyber-cyan peer-checked:border-cyber-cyan transition-colors flex items-center justify-center">
                {value && <span className="text-cyber-black text-xs">✓</span>}
              </span>
              <span className="text-xs">{formatPermission(key)}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-cyber-red/10 border border-cyber-red/30 rounded-sm">
          <p className="text-sm text-cyber-red font-alert">{error}</p>
        </div>
      )}

      <CyberButton type="submit" className="w-full" loading={loading}>
        Update User
      </CyberButton>
    </form>
  )
}

function formatPermission(key: string): string {
  return key
    .replace(/^can_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
