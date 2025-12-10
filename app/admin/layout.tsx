import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DataStreamBg } from "@/components/cyberpunk/data-stream-bg"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.userLevel !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen h-screen w-screen flex relative bg-cyber-black overflow-hidden">
      <DataStreamBg className="opacity-20" />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <AdminSidebar username={session.username} />
      <main className="flex-1 w-full ml-0 md:ml-20 lg:ml-72 p-3 sm:p-4 md:p-5 lg:p-6 pt-16 sm:pt-20 md:pt-6 relative z-10 transition-all duration-300 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
