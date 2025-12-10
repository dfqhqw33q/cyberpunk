"use client"

import type React from "react"
import { useState } from "react"
import { CyberInput } from "@/components/cyberpunk/cyber-input"
import { CyberButton } from "@/components/cyberpunk/cyber-button"
import { PasswordStrengthMeter } from "@/components/cyberpunk/password-strength"
import { FormSection } from "./form-section"
import { User, Lock, CheckCircle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddUserFormProps {
  onSuccess: () => void
  onCancel?: () => void
  formId?: string
  hideActions?: boolean
}

export function AddUserForm({ onSuccess, onCancel, formId, hideActions }: AddUserFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [userLevel, setUserLevel] = useState<"admin" | "regular">("regular")
  const [restrictions, setRestrictions] = useState({
    can_add_users: false,
    can_edit_users: false,
    can_view_logs: false,
    can_manage_roles: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          userLevel,
          restrictions,
        }),
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || "Failed to create user")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6 md:space-y-8 w-full">
      {/* Credentials Section */}
      <FormSection
        title="Login Credentials"
        icon={<User size={18} />}
        color="cyan"
        subtitle="Set up the account username and password"
      >
        <div className="space-y-4 md:space-y-5">
          <CyberInput
            label="Username"
            icon={<User size={18} />}
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="space-y-3">
            <CyberInput
              label="Password"
              icon={<Lock size={18} />}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrengthMeter password={password} />
          </div>
        </div>
      </FormSection>

      {/* User Level Section */}
      <FormSection
        title="Access Level"
        icon={<Shield size={18} />}
        color="magenta"
        subtitle="Define the user's role and permissions level"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <label
            className={cn(
              "flex items-center gap-3 cursor-pointer p-4 rounded-sm transition-all duration-300 touch-manipulation",
              "border min-h-[72px] relative overflow-hidden group",
              userLevel === "regular"
                ? "bg-cyber-cyan/20 border-cyber-cyan shadow-[0_0_20px_rgba(0,255,255,0.3),inset_0_0_20px_rgba(0,255,255,0.1)]"
                : "bg-cyber-black/30 border-cyber-cyan/20 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40",
            )}
          >
            <input
              type="radio"
              name="userLevel"
              value="regular"
              checked={userLevel === "regular"}
              onChange={() => setUserLevel("regular")}
              className="sr-only"
            />
            <span
              className={cn(
                "w-6 h-6 border-2 rounded-full transition-all shrink-0 flex items-center justify-center",
                userLevel === "regular"
                  ? "border-cyber-cyan bg-cyber-cyan"
                  : "border-cyber-cyan/50 group-hover:border-cyber-cyan",
              )}
            >
              {userLevel === "regular" && <CheckCircle size={14} className="text-cyber-black" />}
            </span>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-xs sm:text-sm font-display uppercase tracking-wider block",
                  userLevel === "regular" ? "text-cyber-cyan" : "text-foreground group-hover:text-cyber-cyan",
                )}
              >
                Regular User
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">Standard access</span>
            </div>
            {userLevel === "regular" && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyber-cyan rounded-full animate-pulse shrink-0" />
            )}
          </label>

          <label
            className={cn(
              "flex items-center gap-3 cursor-pointer p-4 rounded-sm transition-all duration-300 touch-manipulation",
              "border min-h-[72px] relative overflow-hidden group",
              userLevel === "admin"
                ? "bg-cyber-magenta/20 border-cyber-magenta shadow-[0_0_20px_rgba(255,0,255,0.3),inset_0_0_20px_rgba(255,0,255,0.1)]"
                : "bg-cyber-black/30 border-cyber-magenta/20 hover:bg-cyber-magenta/10 hover:border-cyber-magenta/40",
            )}
          >
            <input
              type="radio"
              name="userLevel"
              value="admin"
              checked={userLevel === "admin"}
              onChange={() => setUserLevel("admin")}
              className="sr-only"
            />
            <span
              className={cn(
                "w-6 h-6 border-2 rounded-full transition-all shrink-0 flex items-center justify-center",
                userLevel === "admin"
                  ? "border-cyber-magenta bg-cyber-magenta"
                  : "border-cyber-magenta/50 group-hover:border-cyber-magenta",
              )}
            >
              {userLevel === "admin" && <CheckCircle size={14} className="text-cyber-black" />}
            </span>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-xs sm:text-sm font-display uppercase tracking-wider block",
                  userLevel === "admin" ? "text-cyber-magenta" : "text-foreground group-hover:text-cyber-magenta",
                )}
              >
                Administrator
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">Full control</span>
            </div>
            {userLevel === "admin" && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyber-magenta rounded-full animate-pulse shrink-0" />
            )}
          </label>
        </div>
      </FormSection>

      {/* Permissions Section */}
      <FormSection
        title="Permissions"
        icon={<Shield size={18} />}
        color="green"
        subtitle="Grant specific administrative capabilities"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {Object.entries(restrictions).map(([key, value]) => (
            <label
              key={key}
              className={cn(
                "flex items-center gap-3 cursor-pointer p-3 rounded-sm transition-all duration-300 touch-manipulation",
                "border min-h-14 relative group",
                value
                  ? "bg-cyber-green/20 border-cyber-green shadow-[0_0_15px_rgba(0,255,65,0.25)]"
                  : "bg-cyber-black/30 border-cyber-cyan/20 hover:bg-cyber-green/5 hover:border-cyber-green/30",
              )}
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setRestrictions({ ...restrictions, [key]: e.target.checked })}
                className="sr-only"
              />
              <span
                className={cn(
                  "w-5 h-5 border-2 rounded-sm transition-all shrink-0 flex items-center justify-center",
                  value
                    ? "border-cyber-green bg-cyber-green"
                    : "border-cyber-cyan/50 group-hover:border-cyber-green/70",
                )}
              >
                {value && (
                  <svg
                    className="w-3 h-3 text-cyber-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                className={cn(
                  "text-xs sm:text-sm font-mono transition-colors",
                  value ? "text-cyber-green" : "text-foreground group-hover:text-cyber-green",
                )}
              >
                {formatPermission(key)}
              </span>
              {value && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse shrink-0" />
              )}
            </label>
          ))}
        </div>
      </FormSection>

      {/* Error Message */}
      {error && (
        <div className="p-3 sm:p-4 bg-cyber-red/10 border border-cyber-red/30 rounded-sm animate-in shake">
          <p className="text-xs sm:text-sm text-cyber-red font-mono">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      {!hideActions && (
        <div className="pt-4 border-t border-cyber-cyan/20 flex flex-col-reverse sm:flex-row gap-3">
          {onCancel && (
            <CyberButton
              type="button"
              variant="ghost"
              className="flex-1 sm:flex-none sm:min-w-[140px]"
              onClick={onCancel}
            >
              Cancel
            </CyberButton>
          )}
          <CyberButton type="submit" className="flex-1 sm:flex-none sm:min-w-[180px]" loading={loading}>
            Create User
          </CyberButton>
        </div>
      )}
    </form>
  )
}

function formatPermission(key: string): string {
  return key
    .replace(/^can_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
