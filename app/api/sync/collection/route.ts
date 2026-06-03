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

    // Fetch user names for saved topics (limit to first 3 per topic)
    const allUserIds = [...new Set(grouped.values().flatMap((g) => g.userIds))]
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", allUserIds)
    const userNames = new Map((users || []).map((u) => [u.id, u.name]))

    type SavedUserEntry = { id: string; name: string }

    const topics = topicIds.map((topicId) => {
      const g = grouped.get(topicId)!
      const savedUsers: { name: string; initials: string }[] = g.userIds
        .map((uid: string): SavedUserEntry => ({ id: uid, name: userNames.get(uid) || "User" }))
        .filter((u: SavedUserEntry, i: number, arr: SavedUserEntry[]) => arr.findIndex((a: SavedUserEntry) => a.id === u.id) === i)
        .slice(0, 3)
        .map((u: SavedUserEntry) => ({ name: u.name, initials: u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) }))
      return {
        topic_id: topicId,
        title: g.title,
        save_count: g.saveCount,
        vote_score: voteScores.get(topicId) || 0,
        user_vote: userVotes.get(topicId) || null,
        saved_users: savedUsers,
        saved_by_name: savedUsers[0]?.name || "User",
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
    const { userId, topicId, title, score, total, cardsViewed, totalCards } = await req.json()

    if (!userId || !topicId) {
      return NextResponse.json({ error: "userId and topicId required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("saved_topics")
      .insert({ user_id: userId, topic_id: topicId, title: title || topicId, score: score || 0, total: total || 0, cards_viewed: cardsViewed || 0, total_cards: totalCards || 0 })
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
