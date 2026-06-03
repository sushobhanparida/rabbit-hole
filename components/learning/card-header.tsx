"use client"

import { X } from "lucide-react"

interface CardHeaderProps {
  current: number
  total: number
  onClose: () => void
}

export function CardHeader({ current, total, onClose }: CardHeaderProps) {
  const progress = ((current + 1) / total) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-surface/80 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-[600px] mx-auto px-5 h-full flex items-center gap-3">
        <span className="font-label text-[11px] tracking-[0.15em] text-on-surface-variant flex-shrink-0">
          {current + 1} / {total}
        </span>
        <div className="flex-1 h-1.5 bg-primary-container/30 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar-gradient rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#737373] hover:bg-[#1a1a1a] hover:text-white transition-colors active:scale-[0.92]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
