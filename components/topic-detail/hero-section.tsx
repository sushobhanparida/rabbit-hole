"use client"

import { Topic } from "@/lib/types"

interface HeroSectionProps {
  topic: Topic
}

export function HeroSection({ topic }: HeroSectionProps) {
  return (
    <div className="mb-8">
      <div
        className="w-full h-[240px] sm:h-[300px] rounded-[24px] bg-cover bg-center mb-6"
        style={{ backgroundImage: `url(${topic.image})` }}
      />
      <div className="reading-width">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1a1a] leading-tight mb-3">
          {topic.title}
        </h1>
        <p className="text-base text-[#737373] leading-relaxed">
          {topic.description}
        </p>
      </div>
    </div>
  )
}
