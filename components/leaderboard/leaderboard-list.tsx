"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { Trophy, Medal } from "lucide-react"

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
<div className="flex flex-col gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card h-20 rounded-[24px] flex items-center px-5 gap-4">
            <div className="w-8 flex-shrink-0" />
            <div className="w-10 h-10 rounded-full bg-surface-container animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-surface-container rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-surface-container rounded animate-pulse" />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-3 w-16 bg-surface-container rounded animate-pulse ml-auto" />
              <div className="h-2.5 w-8 bg-surface-container rounded animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="glass-card rounded-[24px] p-8 text-center spring-up">
        <Trophy className="h-10 w-10 text-outline mx-auto mb-3" />
        <p className="text-sm text-outline">No leaderboard data yet</p>
        <p className="text-xs text-outline mt-1">Complete topics to earn XP and appear here</p>
      </div>
    )
  }

  const rankIcon = (rank: number, isMe: boolean) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-secondary-container" />
    if (rank === 2) return <Medal className="h-5 w-5 text-outline" />
    if (rank === 3) return <Medal className="h-5 w-5" style={{ color: "#cd7f32" }} />
    return (
      <span className={`font-label text-xs tabular-nums ${isMe ? "text-white/60" : "text-outline"}`}>
        #{rank}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      {entries.map((entry, i) => {
        const isMe = entry.id === user?.id
        return (
          <div
            key={entry.id}
            className={`${isMe ? "bg-[#1a1a1a] text-white" : "glass-card"} h-20 rounded-[24px] flex items-center px-5 gap-4 spring-up hover:scale-[1.02] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-8 flex-shrink-0 flex justify-center">
              {rankIcon(entry.rank, isMe)}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
              isMe ? "bg-white/20 text-white" : "bg-[#f0f0f0] text-[#525252]"
            }`}>
              {entry.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-tight truncate ${isMe ? "text-white" : "text-on-surface"}`}>
                {isMe ? "You" : entry.name}
              </p>
              <p className={`text-[11px] whitespace-nowrap ${isMe ? "text-white/50" : "text-[#a3a3a3]"}`}>
                {entry.topics_completed} {entry.topics_completed === 1 ? "rabbit hole" : "rabbit holes"}
              </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <p className={`font-heading font-bold text-sm leading-tight tabular-nums ${isMe ? "text-white" : "text-primary"}`}>
                {entry.xp.toLocaleString()}
              </p>
              <span className={`font-label text-[10px] ${isMe ? "text-white/50" : "text-outline"}`}>XP</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
