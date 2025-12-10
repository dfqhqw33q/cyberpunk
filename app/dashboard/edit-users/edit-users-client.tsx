'use client'

import { useState, useEffect, useCallback } from 'react'
import { CyberPanel } from '@/components/cyberpunk/cyber-panel'
import { CyberButton } from '@/components/cyberpunk/cyber-button'
import { CyberInput } from '@/components/cyberpunk/cyber-input'
import { AlertTriangle, RefreshCw, Pencil, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  username: string
  user_level: 'admin' | 'regular'
  is_active: boolean
  is_locked: boolean
  restrictions: {
    can_add_users: boolean
    can_edit_users: boolean
    can_view_logs: boolean
    can_manage_roles: boolean
  }
}

export function EditUsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<User> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/users')
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to fetch users')
        return
      }

      setUsers(data.users || [])
    } catch (err) {
      setError('Failed to fetch users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditingData({ ...user })
  }

  const handleCancel = () => {
    setEditingUserId(null)
    setEditingData(null)
  }

  const handleSave = async () => {
    if (!editingUserId || !editingData) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: editingData.is_active,
          restrictions: editingData.restrictions,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update user')
        return
      }

      // Update local state
      setUsers(users.map(u => u.id === editingUserId ? (editingData as User) : u))
      setEditingUserId(null)
      setEditingData(null)
    } catch (err) {
      setError('Failed to update user')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePermissionChange = (permission: keyof User['restrictions']) => {
    if (!editingData?.restrictions) return
    setEditingData(prev => {
      if (!prev || !prev.restrictions) return prev
      return {
        ...prev,
        restrictions: {
          ...prev.restrictions,
          [permission]: !prev.restrictions[permission],
        },
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Loading users...</p>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-cyber-cyan/10 rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-sm bg-cyber-red/10 border border-cyber-red/30">
        <AlertTriangle className="text-cyber-red shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm text-cyber-red font-display">Error Loading Users</p>
          <p className="text-xs text-cyber-red/70">{error}</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No users available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && users.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-sm bg-cyber-yellow/10 border border-cyber-yellow/30">
          <AlertTriangle className="text-cyber-yellow shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-cyber-yellow">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b border-cyber-cyan/20">
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase">Username</th>
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase hidden md:table-cell">Level</th>
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase hidden lg:table-cell">Status</th>
              <th className="text-center p-2 md:p-3 text-cyber-cyan font-display uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                {editingUserId === user.id ? (
                  // Editing row
                  <>
                    <td colSpan={4} className="p-4">
                      <CyberPanel variant="default" className="space-y-4">
                        <div>
                          <h3 className="text-sm font-display text-cyber-cyan mb-4">
                            Edit User: {user.username}
                          </h3>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`active_${user.id}`}
                            checked={editingData?.is_active ?? false}
                            onCheckedChange={(checked) =>
                              setEditingData(prev => prev ? { ...prev, is_active: checked as boolean } : null)
                            }
                            disabled={isSaving}
                          />
                          <Label htmlFor={`active_${user.id}`} className="text-sm cursor-pointer">
                            Active
                          </Label>
                        </div>

                        {/* Permissions */}
                        <div className="space-y-2 pt-2 border-t border-cyber-cyan/20">
                          <Label className="text-xs uppercase tracking-wider text-cyber-cyan">Permissions</Label>
                          {[
                            { key: 'can_add_users', label: 'Can Add Users' },
                            { key: 'can_edit_users', label: 'Can Edit Users' },
                            { key: 'can_view_logs', label: 'Can View Logs' },
                            { key: 'can_manage_roles', label: 'Can Manage Roles' },
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                              <Checkbox
                                id={`perm_${user.id}_${key}`}
                                checked={editingData?.restrictions?.[key as keyof typeof editingData.restrictions] ?? false}
                                onCheckedChange={() => handlePermissionChange(key as keyof User['restrictions'])}
                                disabled={isSaving}
                              />
                              <Label htmlFor={`perm_${user.id}_${key}`} className="text-sm cursor-pointer">
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-4">
                          <CyberButton
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1"
                            size="sm"
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </CyberButton>
                          <CyberButton
                            onClick={handleCancel}
                            disabled={isSaving}
                            variant="secondary"
                            className="flex-1"
                            size="sm"
                          >
                            Cancel
                          </CyberButton>
                        </div>
                      </CyberPanel>
                    </td>
                  </>
                ) : (
                  // Display row
                  <>
                    <td className="p-2 md:p-3 font-display text-cyber-cyan">{user.username}</td>
                    <td className="p-2 md:p-3 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-sm bg-cyber-magenta/10 text-cyber-magenta text-[10px] font-display uppercase">
                        {user.user_level}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-display uppercase ${
                        user.is_active
                          ? 'bg-cyber-green/10 text-cyber-green'
                          : 'bg-cyber-red/10 text-cyber-red'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 text-center">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 md:p-2 rounded-sm border border-cyber-cyan/30 hover:border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors inline-flex"
                        title="Edit user"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
