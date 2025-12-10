'use client'

import { useState, useEffect, useCallback } from 'react'
import { CyberPanel } from '@/components/cyberpunk/cyber-panel'
import { CyberButton } from '@/components/cyberpunk/cyber-button'
import { AlertTriangle, RefreshCw, Pencil } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  username: string
  user_level: 'admin' | 'regular'
  is_active: boolean
}

export function ManageRolesClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingLevel, setEditingLevel] = useState<'admin' | 'regular'>('regular')
  const [isSaving, setIsSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/roles')
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
    setEditingLevel(user.user_level)
  }

  const handleCancel = () => {
    setEditingUserId(null)
    setEditingLevel('regular')
  }

  const handleSave = async () => {
    if (!editingUserId) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/roles/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_level: editingLevel }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update role')
        return
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === editingUserId ? { ...u, user_level: editingLevel } : u
      ))
      setEditingUserId(null)
      setEditingLevel('regular')
    } catch (err) {
      setError('Failed to update role')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
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
              <th className="text-left p-2 md:p-3 text-cyber-cyan font-display uppercase">Current Role</th>
              <th className="text-center p-2 md:p-3 text-cyber-cyan font-display uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                {editingUserId === user.id ? (
                  // Editing row
                  <>
                    <td colSpan={3} className="p-4">
                      <CyberPanel variant="default" className="space-y-4">
                        <div>
                          <h3 className="text-sm font-display text-cyber-cyan mb-4">
                            Edit Role: {user.username}
                          </h3>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-cyber-cyan">Select Role</Label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id={`regular_${user.id}`}
                                name={`role_${user.id}`}
                                value="regular"
                                checked={editingLevel === 'regular'}
                                onChange={() => setEditingLevel('regular')}
                                disabled={isSaving}
                                className="cursor-pointer"
                              />
                              <Label htmlFor={`regular_${user.id}`} className="text-sm cursor-pointer">
                                Regular User
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id={`admin_${user.id}`}
                                name={`role_${user.id}`}
                                value="admin"
                                checked={editingLevel === 'admin'}
                                onChange={() => setEditingLevel('admin')}
                                disabled={isSaving}
                                className="cursor-pointer"
                              />
                              <Label htmlFor={`admin_${user.id}`} className="text-sm cursor-pointer">
                                Admin
                              </Label>
                            </div>
                          </div>
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
                    <td className="p-2 md:p-3">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-display uppercase ${
                        user.user_level === 'admin'
                          ? 'bg-cyber-magenta/10 text-cyber-magenta'
                          : 'bg-cyber-cyan/10 text-cyber-cyan'
                      }`}>
                        {user.user_level}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 text-center">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 md:p-2 rounded-sm border border-cyber-cyan/30 hover:border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors inline-flex"
                        title="Edit role"
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
