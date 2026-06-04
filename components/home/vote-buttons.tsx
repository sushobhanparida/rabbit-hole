"use client"

import { useState, useEffect } from "react"
import { ArrowBigUp, ArrowBigDown, X } from "lucide-react"
import { motion } from "framer-motion"
import { createPortal } from "react-dom"

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
  const [showLogin, setShowLogin] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const handleVote = async (dir: 1 | -1) => {
    if (!userId) { setShowLogin(true); return }
    if (busy) return

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
    <>
      <div className="flex flex-col items-center gap-px shrink-0">
        <button
          onClick={() => handleVote(1)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
            vote === 1 ? "text-primary bg-primary-container/30" : "text-outline hover:text-primary hover:bg-primary-container/30"
          }`}
        >
          <ArrowBigUp className="h-3.5 w-3.5" />
        </button>
        <span className={`font-label text-[10px] font-bold tabular-nums text-center ${
          score > 0 ? "text-on-surface" : "text-outline"
        }`}>
          {score}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors active:scale-90 ${
            vote === -1 ? "text-error bg-error-container/30" : "text-outline hover:text-error hover:bg-error-container/30"
          }`}
        >
          <ArrowBigDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {showLogin && mounted && createPortal(
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={() => setShowLogin(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[20%] mx-auto max-w-sm bg-white rounded-[24px] z-[101] p-6 shadow-xl border border-[#f0f0f0] text-center"
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-[#a3a3a3] hover:text-[#1a1a1a] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center mx-auto mb-4">
              <ArrowBigUp className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">Log in to vote</h2>
            <p className="text-sm text-[#737373] mb-6">Create an account or log in to upvote topics in the community.</p>
            <button
              onClick={() => setShowLogin(false)}
              className="w-full h-12 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97]"
            >
              Got it
            </button>
          </motion.div>
        </>,
        document.body
      )}
    </>
  )
}
