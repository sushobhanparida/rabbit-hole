"use client"

import { motion } from "framer-motion"
import { Headphones, Share2, RotateCcw } from "lucide-react"
import type { NarrationState } from "@/hooks/use-narration"

interface CardFooterProps {
  narrationState?: NarrationState
  onToggleNarration?: () => void
  onRestartNarration?: () => void
  listeningMinutes?: number
}

export function CardFooter({ narrationState, onToggleNarration, onRestartNarration, listeningMinutes }: CardFooterProps) {
  const isPaused = narrationState === "paused"
  const isSpeaking = narrationState === "speaking"
  const isActive = isSpeaking || isPaused

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <div className="bg-white/92 backdrop-blur-md pt-3 pb-3 px-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleNarration}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-full px-5 py-2.5 transition-all active:scale-[0.97] ${
              isActive
                ? "bg-primary-container/70 text-on-primary-container"
                : "bg-primary-container/50 text-on-primary-container hover:bg-primary-container/70"
            } ${isSpeaking ? "animate-pulse-glow" : ""}`}
          >
            <Headphones className="h-4 w-4" />
            <span className="font-heading text-xs font-bold tracking-wide">
              {isPaused ? "PAUSED" : isSpeaking ? "PLAYING" : "LISTEN"}
            </span>
            <span className="text-[10px] opacity-60">{listeningMinutes ?? 5}M</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: document.title, url: window.location.href })
              }
            }}
            className="pointer-events-auto w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-on-primary-container hover:bg-primary-container/50 transition-all active:scale-[0.92]"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {isActive && onRestartNarration && (
          <div className="flex justify-center mt-3 pointer-events-auto">
            <button
              onClick={onRestartNarration}
              className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
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
