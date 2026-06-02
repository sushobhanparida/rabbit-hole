"use client"

import { HomeHeader } from "@/components/home/header"
import { SearchBar } from "@/components/home/search-bar"
import { Section } from "@/components/home/section"
import { VoteButtons } from "@/components/home/vote-buttons"
import { HomeNav } from "@/components/home/home-nav"
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Users, Lightbulb } from "lucide-react"
import { useEffect, useState } from "react"

interface CommunityTopic {
  topic_id: string
  title: string
  save_count: number
  vote_score: number
  user_vote: number | null
}

export default function HomePage() {
  const collection = useStore((s) => s.collection)
  const user = useStore((s) => s.user)
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home")
  const [communityTopics, setCommunityTopics] = useState<CommunityTopic[]>([])
  const [loading, setLoading] = useState(true)

  const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

  useEffect(() => {
    const params = user?.id ? `?userId=${encodeURIComponent(user.id)}` : ""
    fetch(`/api/sync/collection${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.topics) setCommunityTopics(data.topics)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <div className="pb-20">
      <HomeHeader />
      <SearchBar />

      {activeTab === "home" ? (
        <>
          {collection.length > 0 && (
            <Section title="My Collection">
              {collection.map((item) => (
                <Link key={item.topicId} href={`/learn/${item.topicId}/cards?title=${encodeURIComponent(item.title)}`} className="block">
                  <motion.article
                    whileTap={{ scale: 0.97 }}
                    className="flex-shrink-0 w-[200px] sm:w-[220px] h-[180px] bg-white rounded-[24px] overflow-hidden shadow-card border border-[#f0f0f0] cursor-pointer hover:shadow-elevate transition-shadow duration-300 p-5 flex flex-col"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4 flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-[#525252]" />
                    </div>
                    <h3
                      className="font-sans text-sm font-semibold text-[#1a1a1a] leading-tight line-clamp-2 mb-2"
                      title={item.title}
                    >
                      {titleCase(item.title)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#a3a3a3] mt-auto">
                      <span>{item.score}/{item.total} correct</span>
                      <span className="w-1 h-1 rounded-full bg-[#d1d1d1]" />
                      <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </Section>
          )}

          <Section title="Community" fullWidth>
            {loading ? (
              <div className="w-full bg-[#f8f8f8] rounded-[24px] p-5 border border-[#f0f0f0]">
                <p className="text-xs text-[#a3a3a3]">Loading...</p>
              </div>
            ) : communityTopics.length === 0 ? (
              <div className="w-full bg-[#f8f8f8] rounded-[24px] p-5 border border-[#f0f0f0]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#eee] flex items-center justify-center">
                    <Users className="h-4 w-4 text-[#525252]" />
                  </div>
                  <p className="text-sm font-medium text-[#525252]">No topics saved by the community yet</p>
                </div>
                <p className="text-xs text-[#a3a3a3] ml-11">Complete a topic and save it to your collection to be the first!</p>
              </div>
            ) : (
              communityTopics.map((topic) => (
                <div key={topic.topic_id} className="w-full bg-white rounded-[24px] shadow-card border border-[#f0f0f0] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-[#525252]" />
                  </div>
                  <Link href={`/learn/${topic.topic_id}/cards?title=${encodeURIComponent(topic.title)}`} className="flex-1 min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] truncate hover:underline" title={topic.title}>
                      {titleCase(topic.title)}
                    </h3>
                    <p className="text-[10px] text-[#a3a3a3] mt-0.5">{topic.save_count} {topic.save_count === 1 ? "person" : "people"} saved this</p>
                  </Link>
                  <VoteButtons
                    topicId={topic.topic_id}
                    initialScore={topic.vote_score}
                    initialUserVote={topic.user_vote}
                    userId={user?.id}
                  />
                </div>
              ))
            )}
          </Section>

          {collection.length === 0 && (
            <Section title="Getting Started" fullWidth>
              <div className="w-full bg-[#f8f8f8] rounded-[24px] p-5 border border-[#f0f0f0] flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#eee] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="h-5 w-5 text-[#525252]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#525252] mb-1">Type any topic to dive in</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    You'll get smart cards, a quiz, and connected topics to explore next. Complete topics to build your collection.
                  </p>
                </div>
              </div>
            </Section>
          )}
        </>
      ) : (
        <section className="px-0.5">
          <h2 className="text-base font-semibold text-[#1a1a1a] mb-4">Leaderboard</h2>
          <LeaderboardList />
        </section>
      )}

      <HomeNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
