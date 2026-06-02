"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause } from "lucide-react"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false)
            return 0
          }
          return p + 0.5
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  const togglePlay = () => setIsPlaying(!isPlaying)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const totalSeconds = 240
  const elapsed = (progress / 100) * totalSeconds
  const remaining = totalSeconds - elapsed

  return (
    <div className="bg-[#f8f8f8] rounded-[24px] p-5 border border-[#f0f0f0]">
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 h-12 w-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#333] transition-colors active:scale-95"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>

        {/* Progress */}
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-[#e4e4e4] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-[#1a1a1a] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#a3a3a3]">
            <span>{formatTime(elapsed)}</span>
            <span>-{formatTime(remaining)}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <p className="text-xs text-[#a3a3a3] text-center mt-3">
        {isPlaying ? "Narrating..." : "Tap to listen"}
      </p>
    </div>
  )
}
