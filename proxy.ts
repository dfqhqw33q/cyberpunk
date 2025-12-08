import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

// Next.js 16 requires 'proxy' named export or default export
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
