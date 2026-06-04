"use client"

import Link from "next/link"
import { ConnectedTopic } from "@/lib/types"
import { ArrowUpRight, Sparkles } from "lucide-react"

interface ConnectedTopicsProps {
  topics: ConnectedTopic[]
}

export function ConnectedTopics({ topics }: ConnectedTopicsProps) {
  if (!topics || topics.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-3">
        Explore Further
      </h3>
      <div className="space-y-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/learn/${encodeURIComponent(topic.id)}/cards?title=${encodeURIComponent(topic.title)}`}
            className="flex items-center justify-between w-full p-4 rounded-[16px] border border-[#e4e4e4] bg-white hover:border-[#1a1a1a] transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="mb-0.5">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">
                  {topic.title}
                </p>
              </div>
              <p className="text-xs text-[#737373] leading-snug line-clamp-2">
                {topic.description}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-[#a3a3a3] group-hover:text-[#1a1a1a] flex-shrink-0 ml-4 transition-colors" />
          </Link>
        ))}
      </div>
      <p className="flex items-center gap-1.5 mt-4 text-[11px] text-[#b0b0b0] leading-relaxed">
        <Sparkles className="h-3 w-3 shrink-0" />
        AI-suggested connections — some may be off or surface-level
      </p>
    </div>
  )
}
