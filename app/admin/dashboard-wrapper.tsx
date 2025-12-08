import { getSession } from "@/lib/auth"
import { adminGetAllUsers, adminGetAuditLogs } from "@/lib/admin"
import AdminDashboardClient from "./page"

export default async function AdminDashboardWrapper() {
  const session = await getSession()
  if (!session) return null

  const [usersResult, logsResult] = await Promise.all([
    adminGetAllUsers(session.userId),
    adminGetAuditLogs(session.userId, undefined, undefined, 50), // Fetch more for pagination
  ])

  const users = usersResult.users || []
  const logs = logsResult.logs || []

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.is_active).length,
    lockedUsers: users.filter((u: any) => u.is_locked).length,
    admins: users.filter((u: any) => u.user_level === "admin").length,
  }

  return <AdminDashboardClient stats={stats} logs={logs} username={session.username} />
}
