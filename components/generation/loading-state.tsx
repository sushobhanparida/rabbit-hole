"use client"

import { useEffect, useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingStateProps {
  stage?: "research" | "generating"
}

const researchMessages = [
  "Scanning trusted sources across the web...",
  "Gathering the latest insights and discoveries...",
  "Finding the most interesting perspectives...",
  "Collecting fascinating facts and stories...",
]

const generatingMessages = [
  "Arranging concepts in the perfect order...",
  "Writing clear, engaging explanations...",
  "Designing questions that test understanding...",
  "Finding connections between ideas...",
  "Polishing every detail of your lesson...",
  "Making sure everything clicks together...",
]

function AnimatedMessage({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-sm text-[#a3a3a3] leading-relaxed"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

export function LoadingState({ stage = "generating" }: LoadingStateProps) {
  const isResearch = stage === "research"

  return (
    <div className="flex flex-col min-h-[calc(100dvh-170px)]">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          animate={isResearch ? { rotate: [0, 360] } : { scale: [1, 1.08, 1] }}
          transition={{ duration: isResearch ? 3 : 2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center mb-5 border border-[#f0f0f0]"
        >
          {isResearch ? (
            <Search className="h-6 w-6 text-[#1a1a1a]" />
          ) : (
            <Sparkles className="h-6 w-6 text-[#1a1a1a]" />
          )}
        </motion.div>
        <p className="font-heading text-xl font-bold text-on-surface mb-2">
          Entering rabbit hole..
        </p>
        <AnimatedMessage messages={isResearch ? researchMessages : generatingMessages} />
      </div>
      <p className="text-center text-[11px] text-[#c0c0c0] pb-6">Prototype stage — responses might take 5–10 seconds</p>
    </div>
  )
}
