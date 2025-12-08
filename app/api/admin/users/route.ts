import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { adminRegisterUser } from "@/lib/admin"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.userLevel !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { username, password, userLevel, restrictions } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password required" }, { status: 400 })
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const result = await adminRegisterUser(
      session.userId,
      {
        username,
        password,
        userLevel: userLevel || "regular",
        restrictions: restrictions || {
          can_add_users: false,
          can_edit_users: false,
          can_view_logs: false,
          can_manage_roles: false,
        },
      },
      ipAddress,
      userAgent,
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: result.userId })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
