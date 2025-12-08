import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { adminToggleActive } from "@/lib/admin"
import { headers } from "next/headers"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session || session.userLevel !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { isActive } = await request.json()

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const result = await adminToggleActive(session.userId, id, isActive, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Toggle active error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
