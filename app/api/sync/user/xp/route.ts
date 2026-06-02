import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PUT(req: Request) {
  try {
    const { userId, xp } = await req.json()
    if (!userId || xp === undefined) {
      return NextResponse.json({ error: "userId and xp required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from("users").update({ xp }).eq("id", userId).select().single()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
