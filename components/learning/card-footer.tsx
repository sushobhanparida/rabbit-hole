"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Headphones, Bookmark, Share2, RotateCcw } from "lucide-react"
import type { NarrationState } from "@/hooks/use-narration"

interface CardFooterProps {
  narrationState?: NarrationState
  onToggleNarration?: () => void
  onRestartNarration?: () => void
}

export function CardFooter({ narrationState, onToggleNarration, onRestartNarration }: CardFooterProps) {
  const isPaused = narrationState === "paused"
  const isSpeaking = narrationState === "speaking"
  const isActive = isSpeaking || isPaused

  return (
    <div className="mt-auto pt-6">
      <div className="border-t border-[#f0f0f0] pt-4">
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            {isSpeaking && (
              <motion.span
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-[#1a1a1a]/10"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleNarration}
              className={`transition-all duration-300 ${
                isPaused
                  ? "text-[#1a1a1a] bg-[#ffe8cc] ring-2 ring-[#ffb366]/40"
                  : isSpeaking
                    ? "text-[#1a1a1a] bg-[#f0f0f0] ring-2 ring-[#1a1a1a]/10"
                    : "text-[#a3a3a3] hover:text-[#1a1a1a] hover:bg-[#f8f8f8]"
              }`}
            >
              <Headphones className="h-5 w-5 relative z-10" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="text-[#a3a3a3] hover:text-[#1a1a1a]">
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#a3a3a3] hover:text-[#1a1a1a]">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {isActive && onRestartNarration && (
          <div className="flex justify-center mt-3">
            <button
              onClick={onRestartNarration}
              className="flex items-center gap-1 text-[11px] text-[#a3a3a3] hover:text-[#1a1a1a] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Restart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
