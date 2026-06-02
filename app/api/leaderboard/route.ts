import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    const supabase = createAdminClient()

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, xp")
      .order("xp", { ascending: false })
      .limit(50)

    if (error) throw error

    const userIds = users.map((u) => u.id)

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, topics_completed")
      .in("user_id", userIds)

    const topicCounts = new Map<string, number>()
    if (profiles) {
      for (const p of profiles) {
        topicCounts.set(p.user_id, p.topics_completed || 0)
      }
    }

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      name: u.name,
      xp: u.xp || 0,
      topics_completed: topicCounts.get(u.id) || 0,
    }))

    let currentUser = null
    if (userId) {
      const idx = leaderboard.findIndex((u) => u.id === userId)
      if (idx >= 0) {
        currentUser = leaderboard[idx]
      } else {
        const { data: cu } = await supabase
          .from("users")
          .select("id, name, xp")
          .eq("id", userId)
          .single()

        if (cu) {
          const { data: cp } = await supabase
            .from("profiles")
            .select("topics_completed")
            .eq("user_id", userId)
            .single()

          currentUser = {
            rank: leaderboard.length + 1,
            id: cu.id,
            name: cu.name,
            xp: cu.xp || 0,
            topics_completed: cp?.topics_completed || 0,
          }
        }
      }
    }

    return NextResponse.json({ leaderboard, currentUser })
  } catch (err) {
    console.error("[/api/leaderboard] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
