import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { userChangeCredentials } from "@/lib/user"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newUsername, newPassword } = await request.json()

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: "Current password is required" }, { status: 400 })
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json({ success: false, error: "Please provide a new username or password" }, { status: 400 })
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const result = await userChangeCredentials(
      session.userId,
      currentPassword,
      newUsername || undefined,
      newPassword || undefined,
      ipAddress,
      userAgent,
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 })
    }

    return NextResponse.json({ success: true, changes: result.changes })
  } catch (error) {
    console.error("Change credentials error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
