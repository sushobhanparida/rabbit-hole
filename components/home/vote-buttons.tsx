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
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        className={`p-1 rounded-md transition-colors ${
          vote === 1 ? "text-[#1a1a1a] bg-[#f0f0f0]" : "text-[#a3a3a3] hover:text-[#525252] hover:bg-[#f5f5f5]"
        }`}
      >
        <ArrowBigUp className="h-4 w-4" />
      </button>
      <span className={`text-xs font-semibold min-w-[20px] text-center tabular-nums ${
        score > 0 ? "text-[#1a1a1a]" : score < 0 ? "text-[#a3a3a3]" : "text-[#a3a3a3]"
      }`}>
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        className={`p-1 rounded-md transition-colors ${
          vote === -1 ? "text-[#1a1a1a] bg-[#f0f0f0]" : "text-[#a3a3a3] hover:text-[#525252] hover:bg-[#f5f5f5]"
        }`}
      >
        <ArrowBigDown className="h-4 w-4" />
      </button>
    </div>
  )
}
