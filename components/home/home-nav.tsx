"use client"

import { Home, Trophy } from "lucide-react"

interface HomeNavProps {
  activeTab: "home" | "leaderboard"
  onTabChange: (tab: "home" | "leaderboard") => void
}

export function HomeNav({ activeTab, onTabChange }: HomeNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-t border-[#f0f0f0]">
      <div className="max-w-lg mx-auto flex items-center justify-center gap-24 py-3">
        <button
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "home" ? "text-[#1a1a1a]" : "text-[#a3a3a3] hover:text-[#525252]"
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => onTabChange("leaderboard")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "leaderboard" ? "text-[#1a1a1a]" : "text-[#a3a3a3] hover:text-[#525252]"
          }`}
        >
          <Trophy className="h-6 w-6" />
          <span className="text-xs font-medium">Leaderboard</span>
        </button>
      </div>
    </nav>
  )
}
