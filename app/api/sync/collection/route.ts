import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    const supabase = createAdminClient()

    const { data: saved, error } = await supabase
      .from("saved_topics")
      .select("topic_id, title, user_id")
      .order("saved_at", { ascending: false })

    if (error) throw error

    const grouped = new Map<string, { title: string; saveCount: number; userIds: string[] }>()
    for (const item of saved) {
      const existing = grouped.get(item.topic_id)
      if (existing) {
        existing.saveCount++
        existing.userIds.push(item.user_id)
      } else {
        grouped.set(item.topic_id, { title: item.title, saveCount: 1, userIds: [item.user_id] })
      }
    }

    const topicIds = [...grouped.keys()]

    const { data: votes } = await supabase
      .from("topic_votes")
      .select("topic_id, vote, user_id")
      .in("topic_id", topicIds)

    const voteScores = new Map<string, number>()
    const userVotes = new Map<string, number>()
    if (votes) {
      for (const v of votes) {
        voteScores.set(v.topic_id, (voteScores.get(v.topic_id) || 0) + v.vote)
        if (userId && v.user_id === userId) {
          userVotes.set(v.topic_id, v.vote)
        }
      }
    }

    const topics = topicIds.map((topicId) => {
      const g = grouped.get(topicId)!
      return {
        topic_id: topicId,
        title: g.title,
        save_count: g.saveCount,
        vote_score: voteScores.get(topicId) || 0,
        user_vote: userVotes.get(topicId) || null,
      }
    })

    topics.sort((a, b) => b.vote_score - a.vote_score || b.save_count - a.save_count)

    return NextResponse.json({ topics })
  } catch (err) {
    console.error("[/api/sync/collection] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, topicId, title, score, total } = await req.json()

    if (!userId || !topicId) {
      return NextResponse.json({ error: "userId and topicId required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("saved_topics")
      .insert({ user_id: userId, topic_id: topicId, title: title || topicId, score: score || 0, total: total || 0 })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ saved: true })
      }
      throw error
    }

    return NextResponse.json({ saved: data })
  } catch (err) {
    console.error("[/api/sync/collection] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
