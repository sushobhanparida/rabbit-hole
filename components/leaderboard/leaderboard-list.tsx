"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { Trophy, Medal, Award, Loader2 } from "lucide-react"

interface LeaderboardUser {
  rank: number
  id: string
  name: string
  xp: number
  topics_completed: number
}

export function LeaderboardList() {
  const user = useStore((s) => s.user)
  const [entries, setEntries] = useState<LeaderboardUser[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = user?.id ? `?userId=${encodeURIComponent(user.id)}` : ""
    fetch(`/api/leaderboard${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.leaderboard) setEntries(data.leaderboard)
        if (data.currentUser) setCurrentUser(data.currentUser)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 text-[#a3a3a3] animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <Trophy className="h-10 w-10 text-[#d1d1d1] mx-auto mb-3" />
        <p className="text-sm text-[#a3a3a3]">No leaderboard data yet</p>
        <p className="text-xs text-[#d1d1d1] mt-1">Complete topics to earn XP and appear here</p>
      </div>
    )
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-[#daa520]" />
    if (rank === 2) return <Medal className="h-4 w-4 text-[#a8a8a8]" />
    if (rank === 3) return <Medal className="h-4 w-4 text-[#cd7f32]" />
    return null
  }

  return (
    <div className="flex flex-col gap-1">
      {entries.map((entry) => {
        const isMe = entry.id === user?.id
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-colors ${
              isMe ? "bg-[#1a1a1a] text-white" : "bg-white hover:bg-[#f8f8f8]"
            }`}
          >
            <div className="w-8 text-center flex-shrink-0">
              {rankIcon(entry.rank) || (
                <span className={`text-sm font-semibold tabular-nums ${isMe ? "text-white/60" : "text-[#a3a3a3]"}`}>
                  {entry.rank}
                </span>
              )}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
              isMe ? "bg-white/20 text-white" : "bg-[#f0f0f0] text-[#525252]"
            }`}>
              {entry.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-[#1a1a1a]"}`}>
                {isMe ? "You" : entry.name}
              </p>
              <p className={`text-[11px] ${isMe ? "text-white/50" : "text-[#a3a3a3]"}`}>
                {entry.topics_completed} {entry.topics_completed === 1 ? "topic" : "topics"} completed
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold tabular-nums ${isMe ? "text-white" : "text-[#1a1a1a]"}`}>
                {entry.xp.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#a3a3a3]">XP</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
