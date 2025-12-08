import type React from "react"
import { redirect } from "next/navigation"
import { getSession, getCurrentUser } from "@/lib/auth"
import { UserSidebar } from "@/components/user/user-sidebar"
import { DataStreamBg } from "@/components/cyberpunk/data-stream-bg"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex relative">
      <DataStreamBg className="opacity-20" />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <UserSidebar
        username={session.username}
        userLevel={session.userLevel}
        passwordExpiresAt={user?.password_expires_at}
      />
      <main className="flex-1 ml-0 md:ml-16 lg:ml-72 p-4 md:p-5 lg:p-6 pt-20 md:pt-6 relative z-10 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
