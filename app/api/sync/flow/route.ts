import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const { topicId, topicTitle, cards, quiz, connectedTopics, source } = await req.json()

    if (!topicId) {
      return NextResponse.json({ error: "topicId required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const existing = await supabase
      .from("learning_flows")
      .select("id, source")
      .eq("topic_id", topicId)
      .single()

    if (existing.data) {
      if (existing.data.source === "template" && source === "nvidia") {
        const { data, error } = await supabase
          .from("learning_flows")
          .update({
            cards: JSON.stringify(cards),
            quiz: JSON.stringify(quiz),
            connected_topics: JSON.stringify(connectedTopics),
            source,
          })
          .eq("id", existing.data.id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ flow: data })
      }

      return NextResponse.json({ flow: existing.data })
    }

    const { data, error } = await supabase
      .from("learning_flows")
      .insert({
        topic_id: topicId,
        topic_title: topicTitle || topicId,
        cards: JSON.stringify(cards),
        quiz: JSON.stringify(quiz),
        connected_topics: JSON.stringify(connectedTopics || []),
        source: source || "template",
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ flow: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get("topicId")

    if (!topicId) {
      return NextResponse.json({ error: "topicId required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("learning_flows")
      .select("*")
      .eq("topic_id", topicId)
      .single()

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ flow: null })
    }

    if (error) throw error
    return NextResponse.json({ flow: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
