import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PUT(req: Request) {
  try {
    const { userId, topics_completed } = await req.json()
    if (!userId || topics_completed === undefined) {
      return NextResponse.json({ error: "userId and topics_completed required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const existing = await supabase.from("profiles").select().eq("user_id", userId).single()

    if (existing.data) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ topics_completed })
        .eq("user_id", userId)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ profile: data })
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({ user_id: userId, topics_completed, total_xp: 0 })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ profile: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
