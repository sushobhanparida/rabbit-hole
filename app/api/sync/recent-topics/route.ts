import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { userId, topicId, topicTitle } = await req.json()

    if (!userId || !topicId) {
      return NextResponse.json({ error: "userId and topicId required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const existing = await supabase
      .from("recent_topics")
      .select()
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .single()

    if (existing.data) {
      const { data, error } = await supabase
        .from("recent_topics")
        .update({ viewed_at: new Date().toISOString() })
        .eq("id", existing.data.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ recentTopic: data })
    }

    const count = await supabase
      .from("recent_topics")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)

    if (count.count && count.count >= 10) {
      const oldest = await supabase
        .from("recent_topics")
        .select("id")
        .eq("user_id", userId)
        .order("viewed_at", { ascending: true })
        .limit(1)
        .single()

      if (oldest.data) {
        await supabase.from("recent_topics").delete().eq("id", oldest.data.id)
      }
    }

    const { data, error } = await supabase
      .from("recent_topics")
      .insert({ user_id: userId, topic_id: topicId, topic_title: topicTitle || topicId })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ recentTopic: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("recent_topics")
      .select("*")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(10)

    if (error) throw error
    return NextResponse.json({ recentTopics: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
