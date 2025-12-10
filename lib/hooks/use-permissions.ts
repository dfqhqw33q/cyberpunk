'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface UserPermissions {
  can_add_users: boolean
  can_edit_users: boolean
  can_view_logs: boolean
  can_manage_roles: boolean
}

interface PermissionsResponse {
  success: boolean
  permissions: UserPermissions
  error?: string
}

const POLL_INTERVAL = 5000 // Poll every 5 seconds
let globalPermissions: UserPermissions | null = null
let globalSubscribers: Set<(permissions: UserPermissions) => void> = new Set()

// Global polling mechanism
let pollTimeout: NodeJS.Timeout | null = null

async function fetchPermissions(): Promise<UserPermissions | null> {
  try {
    const response = await fetch('/api/user/permissions')
    if (!response.ok) return null
    const data: PermissionsResponse = await response.json()
    if (data.success) {
      globalPermissions = data.permissions
      // Notify all subscribers
      globalSubscribers.forEach(callback => callback(data.permissions))
      return data.permissions
    }
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
  }
  return null
}

function startGlobalPolling() {
  if (pollTimeout) return // Already polling

  const poll = async () => {
    await fetchPermissions()
    pollTimeout = setTimeout(poll, POLL_INTERVAL)
  }

  poll()
}

function stopGlobalPolling() {
  if (pollTimeout) {
    clearTimeout(pollTimeout)
    pollTimeout = null
  }
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const subscriberRef = useRef<(permissions: UserPermissions) => void | null>(null)

  useEffect(() => {
    setLoading(true)
    
    // Use global permissions if available
    if (globalPermissions) {
      setPermissions(globalPermissions)
      setLoading(false)
    }

    // Create subscriber callback
    const subscriber = (newPermissions: UserPermissions) => {
      setPermissions(newPermissions)
    }

    subscriberRef.current = subscriber
    globalSubscribers.add(subscriber)

    // Start polling if this is the first hook instance
    if (globalSubscribers.size === 1) {
      startGlobalPolling()
      // Initial fetch
      fetchPermissions().then(() => {
        setLoading(false)
      }).catch(err => {
        setError(err.message)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }

    // Cleanup
    return () => {
      if (subscriberRef.current) {
        globalSubscribers.delete(subscriberRef.current)
      }
      if (globalSubscribers.size === 0) {
        stopGlobalPolling()
      }
    }
  }, [])

  const checkPermission = useCallback((permission: keyof UserPermissions): boolean => {
    return permissions?.[permission] ?? false
  }, [permissions])

  return {
    permissions,
    loading,
    error,
    checkPermission,
    canAddUsers: permissions?.can_add_users ?? false,
    canEditUsers: permissions?.can_edit_users ?? false,
    canViewLogs: permissions?.can_view_logs ?? false,
    canManageRoles: permissions?.can_manage_roles ?? false,
  }
}
