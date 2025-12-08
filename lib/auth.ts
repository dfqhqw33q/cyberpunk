import "server-only"
import { cookies } from "next/headers"
import { getSupabaseServiceClient } from "./supabase/server"

// Re-export validation functions for server usage
export { validatePasswordStrength, isPasswordValid, type PasswordStrength } from "./validation"

// Session configuration
const SESSION_COOKIE_NAME = "cyber_session"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// User type
export interface AppUser {
  id: string
  username: string
  user_level: "admin" | "regular"
  restrictions: {
    can_add_users: boolean
    can_edit_users: boolean
    can_view_logs: boolean
    can_manage_roles: boolean
  }
  is_active: boolean
  is_locked: boolean
  failed_attempts: number
  password_expires_at: string
  created_at: string
  updated_at: string
}

export async function createSession(user: AppUser): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = {
    userId: user.id,
    username: user.username,
    userLevel: user.user_level,
    restrictions: user.restrictions,
    expiresAt: Date.now() + SESSION_DURATION,
  }

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })
}

export async function getSession(): Promise<{
  userId: string
  username: string
  userLevel: "admin" | "regular"
  restrictions: AppUser["restrictions"]
} | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) return null

  try {
    const session = JSON.parse(sessionCookie.value)
    if (session.expiresAt < Date.now()) {
      await destroySession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getSession()
  if (!session) return null

  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase.from("app_users").select("*").eq("id", session.userId).single()

  if (error || !data) return null

  return data as AppUser
}

export async function requireAuth(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await requireAuth()
  if (user.user_level !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}

export async function login(
  username: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{
  success: boolean
  user?: AppUser
  error?: string
  code?: string
  attemptsRemaining?: number
}> {
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("app_login", {
    p_username: username,
    p_password: password,
    p_ip_address: ipAddress || "unknown",
    p_user_agent: userAgent || "unknown",
  })

  if (error) {
    console.error("Login error:", error)
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  if (!data.success) {
    return {
      success: false,
      error: data.error,
      code: data.code,
      attemptsRemaining: data.attempts_remaining,
    }
  }

  const user = data.user as AppUser
  await createSession(user)

  return { success: true, user }
}

export async function logout(): Promise<void> {
  await destroySession()
}
