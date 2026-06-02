"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Topic } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TopicCardProps {
  topic: Topic
  variant?: "default" | "continue"
}

export function TopicCard({ topic, variant = "default" }: TopicCardProps) {
  return (
    <Link href={`/learn/${topic.id}`} className="block">
      <motion.article
        whileTap={{ scale: 0.97 }}
        className="flex-shrink-0 w-[200px] sm:w-[220px] bg-white rounded-[24px] overflow-hidden shadow-card border border-[#f0f0f0] cursor-pointer hover:shadow-elevate transition-shadow duration-300"
      >
        <div className="relative h-[130px] sm:h-[140px] overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${topic.image})` }}
          />
          {topic.progress !== undefined && variant === "continue" && (
            <div className="absolute bottom-2 left-3 right-3">
              <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] leading-tight line-clamp-1">
            {topic.title}
          </h3>

          <div className="flex items-center gap-2 mt-2 text-xs text-[#a3a3a3]">
            <span>{topic.duration}</span>
            <span className="w-1 h-1 rounded-full bg-[#d1d1d1]" />
            <span>{topic.completionCount} completed</span>
          </div>

          {variant === "continue" && topic.timeRemaining && (
            <p className="text-xs text-[#525252] mt-2 font-medium">
              {topic.timeRemaining}
            </p>
          )}

          {variant === "default" && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f0f0f0]">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px]">
                  {topic.creator.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-[#a3a3a3]">{topic.creator.name}</span>
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  )
}
