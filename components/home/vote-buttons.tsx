"use client"

import { useState } from "react"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"

interface VoteButtonsProps {
  topicId: string
  initialScore: number
  initialUserVote: number | null
  userId?: string
}

export function VoteButtons({ topicId, initialScore, initialUserVote, userId }: VoteButtonsProps) {
  const [vote, setVote] = useState<number | null>(initialUserVote)
  const [score, setScore] = useState(initialScore)
  const [busy, setBusy] = useState(false)

  const handleVote = async (dir: 1 | -1) => {
    if (!userId || busy) return
    setBusy(true)

    const prevVote = vote
    const prevScore = score

    if (vote === dir) {
      setVote(null)
      setScore(score - dir)
    } else {
      setVote(dir)
      setScore(score - (prevVote ?? 0) + dir)
    }

    try {
      const res = await fetch("/api/sync/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, topicId, vote: dir }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
    } catch {
      setVote(prevVote)
      setScore(prevScore)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <button
        onClick={() => handleVote(1)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
          vote === 1 ? "text-primary bg-primary-container/30" : "text-outline hover:text-primary hover:bg-primary-container/30"
        }`}
      >
        <ArrowBigUp className="h-[18px] w-[18px]" />
      </button>
      <span className={`font-label text-xs font-bold tabular-nums ${
        score > 0 ? "text-on-surface" : "text-outline"
      }`}>
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
          vote === -1 ? "text-error bg-error-container/30" : "text-outline hover:text-error hover:bg-error-container/30"
        }`}
      >
        <ArrowBigDown className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}
