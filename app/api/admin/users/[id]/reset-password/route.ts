import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { adminResetPassword } from "@/lib/admin"
import { headers } from "next/headers"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.userLevel !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { newPassword } = await request.json()

    if (!newPassword) {
      return NextResponse.json({ success: false, error: "New password required" }, { status: 400 })
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const result = await adminResetPassword(session.userId, id, newPassword, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
