import { NextResponse } from "next/server"
import { login } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password required", code: "MISSING_CREDENTIALS" },
        { status: 400 },
      )
    }

    // Get IP and user agent for audit logging
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const result = await login(username, password, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
