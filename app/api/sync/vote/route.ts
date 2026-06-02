import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { userId, topicId, vote } = await req.json()

    if (!userId || !topicId || ![1, -1].includes(vote)) {
      return NextResponse.json({ error: "userId, topicId, and vote (1 or -1) required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const existing = await supabase
      .from("topic_votes")
      .select()
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .single()

    if (existing.data) {
      if (existing.data.vote === vote) {
        await supabase.from("topic_votes").delete().eq("id", existing.data.id)
        return NextResponse.json({ vote: null })
      }
      const { data, error } = await supabase
        .from("topic_votes")
        .update({ vote })
        .eq("id", existing.data.id)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ vote: data })
    }

    const { data, error } = await supabase
      .from("topic_votes")
      .insert({ user_id: userId, topic_id: topicId, vote })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ vote: data })
  } catch (err) {
    console.error("[/api/sync/vote] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
