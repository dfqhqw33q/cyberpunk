import { getSession } from "@/lib/auth"
import { adminGetAuditLogs } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get("limit") || "50", 10)

    const result = await adminGetAuditLogs(session.userId, undefined, undefined, limit)

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error || "Failed to fetch logs" },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      logs: result.logs || [],
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
