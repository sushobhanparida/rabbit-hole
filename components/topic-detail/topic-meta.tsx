"use client"

import { Topic } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Layers } from "lucide-react"

interface TopicMetaProps {
  topic: Topic
}

export function TopicMeta({ topic }: TopicMetaProps) {
  return (
    <div className="reading-width mb-8">
      <div className="flex items-center gap-4 text-sm text-[#737373] mb-5">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{topic.duration}</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-[#d1d1d1]" />
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          <span>{topic.cardCount} cards</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {topic.creator.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]">{topic.creator.name}</p>
          <p className="text-xs text-[#a3a3a3]">Creator</p>
        </div>
      </div>
    </div>
  )
}
