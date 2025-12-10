import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { adminGetAllUsers } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.userLevel !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await adminGetAllUsers(session.userId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to fetch stats" },
        { status: 500 }
      )
    }

    const users = result.users || []
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.is_active).length,
      lockedUsers: users.filter((u: any) => u.is_locked).length,
      admins: users.filter((u: any) => u.user_level === "admin").length,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
