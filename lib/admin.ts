import { getSupabaseServiceClient } from "./supabase/server"
import { type AppUser, isPasswordValid } from "./auth"

export interface CreateUserInput {
  username: string
  password: string
  userLevel: "admin" | "regular"
  restrictions: AppUser["restrictions"]
}

export interface EditUserInput {
  userId: string
  username?: string
  userLevel?: "admin" | "regular"
  restrictions?: AppUser["restrictions"]
}

// Admin: Register new user
export async function adminRegisterUser(
  adminId: string,
  input: CreateUserInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; userId?: string; error?: string; code?: string }> {
  if (!isPasswordValid(input.password)) {
    return {
      success: false,
      error: "Password does not meet requirements",
      code: "WEAK_PASSWORD",
    }
  }

  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("admin_register_user", {
    p_admin_id: adminId,
    p_username: input.username,
    p_password: input.password,
    p_user_level: input.userLevel,
    p_restrictions: input.restrictions,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    userId: data.user_id,
    error: data.error,
    code: data.code,
  }
}

// Admin: Edit user
export async function adminEditUser(
  adminId: string,
  input: EditUserInput,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; error?: string; code?: string }> {
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("admin_edit_user", {
    p_admin_id: adminId,
    p_user_id: input.userId,
    p_username: input.username,
    p_user_level: input.userLevel,
    p_restrictions: input.restrictions,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    error: data.error,
    code: data.code,
  }
}

// Admin: Toggle user active status
export async function adminToggleActive(
  adminId: string,
  userId: string,
  isActive: boolean,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; error?: string; code?: string }> {
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("admin_toggle_active", {
    p_admin_id: adminId,
    p_user_id: userId,
    p_is_active: isActive,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    error: data.error,
    code: data.code,
  }
}

// Admin: Unlock user
export async function adminUnlockUser(
  adminId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; error?: string; code?: string }> {
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("admin_unlock_user", {
    p_admin_id: adminId,
    p_user_id: userId,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    error: data.error,
    code: data.code,
  }
}

// Admin: Reset user password
export async function adminResetPassword(
  adminId: string,
  userId: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; error?: string; code?: string }> {
  if (!isPasswordValid(newPassword)) {
    return {
      success: false,
      error: "Password does not meet requirements",
      code: "WEAK_PASSWORD",
    }
  }

  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("admin_reset_password", {
    p_admin_id: adminId,
    p_user_id: userId,
    p_new_password: newPassword,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    error: data.error,
    code: data.code,
  }
}

// Admin: Get all users
export async function adminGetAllUsers(
  adminId: string,
): Promise<{ success: boolean; users?: AppUser[]; error?: string; code?: string }> {
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("get_all_users", {
    p_admin_id: adminId,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    users: data.users,
    error: data.error,
    code: data.code,
  }
}

// Admin: Get audit logs
export async function adminGetAuditLogs(
  adminId: string,
  userId?: string,
  action?: string,
  limit?: number,
): Promise<{ success: boolean; logs?: any[]; error?: string; code?: string }> {
  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("get_audit_logs", {
    p_admin_id: adminId,
    p_user_id: userId,
    p_action: action,
    p_limit: limit || 100,
  })

  if (error) {
    return { success: false, error: "Database error", code: "DB_ERROR" }
  }

  return {
    success: data.success,
    logs: data.logs,
    error: data.error,
    code: data.code,
  }
}
