import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { adminGetAllUsers } from "@/lib/admin"
import { UsersTable } from "@/components/admin/users-table"
import { GlitchText } from "@/components/cyberpunk/glitch-text"
import { CyberPanel } from "@/components/cyberpunk/cyber-panel"
import { Users } from "lucide-react"

export default async function UsersPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if regular user has can_edit_users permission
  if (session.userLevel === "regular" && !session.restrictions?.can_edit_users) {
    redirect("/admin")
  }

  const result = await adminGetAllUsers(session.userId)
  const users = result.users || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-cyber-cyan" size={28} />
          <div>
            <GlitchText as="h1" className="text-2xl" glow="cyan">
              USER MANAGEMENT
            </GlitchText>
            <p className="text-muted-foreground text-sm">{users.length} registered users</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <CyberPanel className="!p-0 overflow-hidden">
        <UsersTable users={users} currentUserId={session.userId} />
      </CyberPanel>
    </div>
  )
}
