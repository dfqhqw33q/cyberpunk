import { getSupabaseServiceClient } from "./supabase/server"
import { isPasswordValid } from "./auth"

// User: Change own credentials
export async function userChangeCredentials(
  userId: string,
  currentPassword: string,
  newUsername?: string,
  newPassword?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; error?: string; code?: string; changes?: { username?: boolean; password?: boolean } }> {
  if (newPassword && !isPasswordValid(newPassword)) {
    return {
      success: false,
      error: "Password does not meet requirements",
      code: "WEAK_PASSWORD",
    }
  }

  const supabase = getSupabaseServiceClient()

  const { data, error } = await supabase.rpc("user_change_credentials", {
    p_user_id: userId,
    p_current_password: currentPassword,
    p_new_username: newUsername,
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
    changes: data.changes,
  }
}
