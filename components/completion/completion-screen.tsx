"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ConnectedTopic } from "@/lib/types"
import { ConnectedTopics } from "./connected-topics"
import { useStore } from "@/lib/store"
import { Award, Home, RotateCcw, BookmarkCheck, LogIn, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"

interface CompletionScreenProps {
  topicId: string
  topicTitle: string
  score: number
  total: number
  connectedTopics: ConnectedTopic[]
  onRestart: () => void
}

export function CompletionScreen({
  topicId,
  topicTitle,
  score,
  total,
  connectedTopics,
  onRestart,
}: CompletionScreenProps) {
  const user = useStore((s) => s.user)
  const login = useStore((s) => s.login)
  const xpBreakdown = useStore((s) => s.session.xpBreakdown)
  const percentage = Math.round((score / total) * 100)

  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedPct, setAnimatedPct] = useState(0)
  const counterRef = useRef(false)

  useEffect(() => {
    if (counterRef.current) return
    counterRef.current = true
    const duration = 1000
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      setAnimatedPct(Math.round(eased * percentage))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, percentage])

  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  let message = ""
  if (percentage >= 80) message = "Outstanding!"
  else if (percentage >= 60) message = "Great job!"
  else if (percentage >= 40) message = "Good effort!"
  else message = "Keep exploring!"

  const handleLoginAndSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim() || !name.trim()) return
    login("", email.trim(), password.trim(), name.trim())
    setShowLogin(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center pt-12 px-5"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-5"
      >
        <Award className="h-8 w-8 text-white" />
      </motion.div>

      {/* Heading */}
      <h2 className="font-heading text-2xl font-bold text-on-surface mb-1">
        {message}
      </h2>
      <p className="text-sm text-[#737373] mb-2">
        You completed <span className="font-medium text-[#1a1a1a]">{topicTitle}</span>
      </p>

      {/* Score */}
      <div className="w-full max-w-[200px] mx-auto mb-4">
        <div className="h-1.5 bg-primary-container/30 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full progress-shimmer rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>
        <p className="text-sm text-[#525252]">
          {animatedScore} / {total} correct ({animatedPct}%)
        </p>
      </div>

      {/* XP */}
      {xpBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-[200px] mx-auto mb-6 glass-card rounded-xl p-4"
        >
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-3 text-center">
            XP Earned
          </p>
          <div className="flex items-end justify-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[#1a1a1a]">{xpBreakdown.quizXp}</p>
              <p className="text-[10px] text-[#a3a3a3]">Quiz</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#1a1a1a]">+{xpBreakdown.toughBonus + xpBreakdown.perfectBonus}</p>
              <p className="text-[10px] text-[#a3a3a3]">Bonus</p>
            </div>
            <div className="w-px h-10 bg-[#e4e4e4]" />
            <div className="text-center">
              <p className="text-xl font-bold text-[#1a1a1a]">{xpBreakdown.total}</p>
              <p className="text-[10px] text-[#a3a3a3]">Total</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save to Collection */}
      {user ? (
        <div className="flex items-center gap-2 text-sm text-[#525252] mb-6">
          <BookmarkCheck className="h-4 w-4" />
          Added to your collection
        </div>
      ) : (
        <button
          onClick={() => setShowLogin(true)}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97] mb-6"
        >
          <LogIn className="h-4 w-4" />
          Sign up to save to collection
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97]"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 h-11 px-6 border border-[#e4e4e4] text-[#525252] rounded-[24px] text-sm font-medium hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>
      </div>

      {/* Connected Topics */}
      {connectedTopics && connectedTopics.length > 0 && (
        <div className="w-full max-w-[400px] text-left">
          <ConnectedTopics topics={connectedTopics} />
        </div>
      )}

      {/* Login Dialog */}
      <AnimatePresence>
        {showLogin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowLogin(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-[20%] mx-auto max-w-sm bg-white rounded-[24px] z-50 p-6 shadow-xl border border-[#f0f0f0]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-[#1a1a1a]">Create account</h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-[#a3a3a3] hover:text-[#1a1a1a] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLoginAndSave} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full h-12 px-4 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[16px] text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full h-12 px-4 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[16px] text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full h-12 px-4 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[16px] text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="w-full h-12 mt-1 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97]"
                >
                  Create & save to collection
                </button>
              </form>

              <p className="text-xs text-[#a3a3a3] text-center mt-4">
                Your data is stored locally. No servers involved.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
