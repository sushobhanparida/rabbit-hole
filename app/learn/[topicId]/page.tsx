"use client"

import { useParams } from "next/navigation"
import { topics } from "@/lib/mock-data"
import { HeroSection } from "@/components/topic-detail/hero-section"
import { TopicMeta } from "@/components/topic-detail/topic-meta"
import { ActionBar } from "@/components/topic-detail/action-bar"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TopicDetailPage() {
  const params = useParams()
  const topic = topics.find((t) => t.id === params.topicId)

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#a3a3a3]">Topic not found</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[#a3a3a3] hover:text-[#1a1a1a] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <HeroSection topic={topic} />
      <TopicMeta topic={topic} />
      <ActionBar topicId={topic.id} />
    </div>
  )
}
