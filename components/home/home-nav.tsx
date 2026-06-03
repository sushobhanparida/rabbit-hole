"use client"

import { Home, Trophy } from "lucide-react"

interface HomeNavProps {
  activeTab: "home" | "leaderboard"
  onTabChange: (tab: "home" | "leaderboard") => void
}

export function HomeNav({ activeTab, onTabChange }: HomeNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-5 pb-6 pt-3 bg-surface/60 backdrop-blur-2xl rounded-t-2xl border-t border-white/20 shadow-[0_-10px_20px_rgba(13,13,13,0.04)] max-w-[600px] mx-auto">
      <button
        onClick={() => onTabChange("home")}
        className={`flex flex-col items-center justify-center gap-1 px-6 py-1 relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 ${
          activeTab === "home" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Home className={`h-6 w-6 mb-1 ${activeTab === "home" ? "fill-current" : ""}`} />
        <span className="font-label text-xs font-bold tracking-wide">Home</span>
        <div className={`w-1.5 h-1.5 rounded-full absolute -bottom-2 ${activeTab === "home" ? "bg-on-surface" : "bg-transparent"}`} />
      </button>
      <button
        onClick={() => onTabChange("leaderboard")}
        className={`flex flex-col items-center justify-center gap-1 px-6 py-1 relative transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 ${
          activeTab === "leaderboard" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Trophy className={`h-6 w-6 mb-1 ${activeTab === "leaderboard" ? "fill-current" : ""}`} />
        <span className="font-label text-xs font-bold tracking-wide">Leaderboard</span>
        <div className={`w-1.5 h-1.5 rounded-full absolute -bottom-2 ${activeTab === "leaderboard" ? "bg-on-surface" : "bg-transparent"}`} />
      </button>
    </nav>
  )
}
