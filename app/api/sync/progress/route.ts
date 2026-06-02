import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, topicId, topicTitle, completed, cardsViewed, totalCards, quizScore, quizTotal, xpEarned, xpBreakdown, quizXpValues } = body

    if (!userId || !topicId) {
      return NextResponse.json({ error: "userId and topicId required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const existing = await supabase
      .from("user_progress")
      .select()
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .single()

    if (existing.data) {
      const { data, error } = await supabase
        .from("user_progress")
        .update({
          completed: completed ?? existing.data.completed,
          cards_viewed: cardsViewed ?? existing.data.cards_viewed,
          total_cards: totalCards ?? existing.data.total_cards,
          quiz_score: quizScore ?? existing.data.quiz_score,
          quiz_total: quizTotal ?? existing.data.quiz_total,
          xp_earned: xpEarned ?? existing.data.xp_earned,
          xp_breakdown: xpBreakdown ? JSON.stringify(xpBreakdown) : existing.data.xp_breakdown,
          quiz_xp_values: quizXpValues ? JSON.stringify(quizXpValues) : existing.data.quiz_xp_values,
          completed_at: completed ? new Date().toISOString() : existing.data.completed_at,
        })
        .eq("id", existing.data.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ progress: data })
    }

    const { data, error } = await supabase
      .from("user_progress")
      .insert({
        user_id: userId,
        topic_id: topicId,
        topic_title: topicTitle || topicId,
        completed: completed || false,
        cards_viewed: cardsViewed || 0,
        total_cards: totalCards || 0,
        quiz_score: quizScore || 0,
        quiz_total: quizTotal || 0,
        xp_earned: xpEarned || 0,
        xp_breakdown: xpBreakdown ? JSON.stringify(xpBreakdown) : null,
        quiz_xp_values: quizXpValues ? JSON.stringify(quizXpValues) : null,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ progress: data })
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
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ progress: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
