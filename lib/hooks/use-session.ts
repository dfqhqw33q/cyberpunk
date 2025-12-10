'use client'

import { useEffect, useState } from 'react'
import type { AppUser } from '@/lib/auth'

interface SessionState {
  user: AppUser | null
  loading: boolean
  error: string | null
}

export function useSession() {
  const [session, setSession] = useState<SessionState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          setSession(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch user',
          }))
          return
        }

        const data = await response.json()
        setSession({
          user: data.user || null,
          loading: false,
          error: null,
        })
      } catch (err) {
        setSession(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      }
    }

    fetchUser()
  }, [])

  return session
}
