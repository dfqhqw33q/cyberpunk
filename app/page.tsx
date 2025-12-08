import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function Home() {
  const session = await getSession()

  if (session) {
    if (session.userLevel === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  } else {
    redirect("/login")
  }
}
