"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Unlock, Power, Key, RefreshCw, MoreVertical } from "lucide-react"
import { CyberButton } from "@/components/cyberpunk/cyber-button"
import { CyberModal } from "@/components/cyberpunk/cyber-modal"
import { StatusBadge } from "@/components/cyberpunk/status-badge"
import { AddUserForm } from "./add-user-form"
import { EditUserForm } from "./edit-user-form"
import { ResetPasswordForm } from "./reset-password-form"
import type { AppUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface UsersTableProps {
  users: AppUser[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setLoading(userId + "-toggle")
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  const handleUnlock = async (userId: string) => {
    setLoading(userId + "-unlock")
    try {
      const res = await fetch(`/api/admin/users/${userId}/unlock`, {
        method: "POST",
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {/* Header with add button */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-cyber-cyan/20">
        <h3 className="font-display text-xs md:text-sm uppercase tracking-wider text-cyber-cyan">Registered Users</h3>
        <CyberButton size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-1 md:mr-2" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </CyberButton>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-cyber-cyan/10">
        {users.map((user: any) => (
          <div key={user.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center shrink-0">
                  <span className="text-cyber-cyan font-display text-sm">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-mono text-sm">{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={user.user_level} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-sm transition-colors",
                  expandedUser === user.id
                    ? "text-cyber-cyan bg-cyber-cyan/20 border border-cyber-cyan/40"
                    : "text-cyber-cyan hover:bg-cyber-cyan/10 border border-transparent",
                )}
              >
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Status:</span>
              {user.is_locked ? (
                <StatusBadge status="locked" />
              ) : user.is_active ? (
                <StatusBadge status="active" />
              ) : (
                <StatusBadge status="inactive" />
              )}
              <span className="ml-auto">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>

            {expandedUser === user.id && (
              <div className="pt-3 border-t border-cyber-cyan/10 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditUser(user)}
                  className="flex items-center justify-center gap-2 p-3 min-h-[48px] text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 rounded-sm transition-colors touch-manipulation"
                >
                  <Edit size={16} />
                  <span className="text-xs uppercase">Edit</span>
                </button>

                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    disabled={loading === user.id + "-toggle"}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 min-h-[48px] rounded-sm transition-colors touch-manipulation border",
                      user.is_active
                        ? "text-cyber-red bg-cyber-red/10 hover:bg-cyber-red/20 border-cyber-red/30"
                        : "text-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 border-cyber-green/30",
                    )}
                  >
                    {loading === user.id + "-toggle" ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Power size={16} />
                    )}
                    <span className="text-xs uppercase">{user.is_active ? "Deactivate" : "Activate"}</span>
                  </button>
                )}

                {user.is_locked && (
                  <button
                    onClick={() => handleUnlock(user.id)}
                    disabled={loading === user.id + "-unlock"}
                    className="flex items-center justify-center gap-2 p-3 min-h-[48px] text-cyber-yellow bg-cyber-yellow/10 hover:bg-cyber-yellow/20 border border-cyber-yellow/30 rounded-sm transition-colors touch-manipulation"
                  >
                    {loading === user.id + "-unlock" ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Unlock size={16} />
                    )}
                    <span className="text-xs uppercase">Unlock</span>
                  </button>
                )}

                <button
                  onClick={() => setResetPasswordUser(user)}
                  className="flex items-center justify-center gap-2 p-3 min-h-[48px] text-cyber-magenta bg-cyber-magenta/10 hover:bg-cyber-magenta/20 border border-cyber-magenta/30 rounded-sm transition-colors touch-manipulation"
                >
                  <Key size={16} />
                  <span className="text-xs uppercase">Reset PW</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View - Made horizontally scrollable */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-cyber-cyan/20 bg-cyber-black/50">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap">
                Username
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap">
                Level
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap">
                Status
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap">
                Created
              </th>
              <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-display whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
                      <span className="text-cyber-cyan font-display text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-sm">{user.username}</span>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={user.user_level} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {user.is_locked ? (
                      <StatusBadge status="locked" />
                    ) : user.is_active ? (
                      <StatusBadge status="active" />
                    ) : (
                      <StatusBadge status="inactive" />
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditUser(user)}
                      className="p-2.5 min-w-[40px] min-h-[40px] text-cyber-cyan hover:bg-cyber-cyan/10 border border-transparent hover:border-cyber-cyan/30 rounded-sm transition-all"
                      title="Edit user"
                    >
                      <Edit size={16} />
                    </button>

                    {user.id !== currentUserId && (
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        disabled={loading === user.id + "-toggle"}
                        className={cn(
                          "p-2.5 min-w-[40px] min-h-[40px] rounded-sm transition-all border border-transparent",
                          user.is_active
                            ? "text-cyber-red hover:bg-cyber-red/10 hover:border-cyber-red/30"
                            : "text-cyber-green hover:bg-cyber-green/10 hover:border-cyber-green/30",
                        )}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {loading === user.id + "-toggle" ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Power size={16} />
                        )}
                      </button>
                    )}

                    {user.is_locked && (
                      <button
                        onClick={() => handleUnlock(user.id)}
                        disabled={loading === user.id + "-unlock"}
                        className="p-2.5 min-w-[40px] min-h-[40px] text-cyber-yellow hover:bg-cyber-yellow/10 border border-transparent hover:border-cyber-yellow/30 rounded-sm transition-all"
                        title="Unlock account"
                      >
                        {loading === user.id + "-unlock" ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setResetPasswordUser(user)}
                      className="p-2.5 min-w-[40px] min-h-[40px] text-cyber-magenta hover:bg-cyber-magenta/10 border border-transparent hover:border-cyber-magenta/30 rounded-sm transition-all"
                      title="Reset password"
                    >
                      <Key size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal - Using larger modal size */}
      <CyberModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New User" size="lg">
        <AddUserForm
          onSuccess={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      </CyberModal>

      {/* Edit User Modal */}
      <CyberModal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="lg">
        {editUser && (
          <EditUserForm
            user={editUser}
            onSuccess={() => {
              setEditUser(null)
              router.refresh()
            }}
          />
        )}
      </CyberModal>

      {/* Reset Password Modal */}
      <CyberModal isOpen={!!resetPasswordUser} onClose={() => setResetPasswordUser(null)} title="Reset Password">
        {resetPasswordUser && (
          <ResetPasswordForm
            user={resetPasswordUser}
            onSuccess={() => {
              setResetPasswordUser(null)
              router.refresh()
            }}
          />
        )}
      </CyberModal>
    </>
  )
}
