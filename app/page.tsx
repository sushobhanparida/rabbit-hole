"use client"

import { HomeHeader } from "@/components/home/header"
import { SearchBar } from "@/components/home/search-bar"
import { Section } from "@/components/home/section"
import { VoteButtons } from "@/components/home/vote-buttons"
import { HomeNav } from "@/components/home/home-nav"
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { Sparkles, Users, Lightbulb, BookOpen } from "lucide-react"
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
    <div>
      <HomeHeader />
      <div className="px-5">
        <SearchBar />

        {activeTab === "home" ? (
          <>
            {collection.length > 0 && (
              <Section title="My Collection">
                {collection.map((item, i) => (
                  <Link key={item.topicId} href={`/learn/${item.topicId}/cards?title=${encodeURIComponent(item.title)}`} className="block spring-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                    <div className="glass-card rounded-2xl w-64 shrink-0 p-5 flex flex-col justify-between min-h-[200px] cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary-container/50 flex items-center justify-center mb-4">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-label text-[10px] tracking-[0.1em] uppercase text-primary">COMPLETED</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-label bg-secondary-container/30 text-secondary uppercase tracking-wider">
                            {item.score}/{item.total}
                          </span>
                        </div>
                        <h3 className="font-heading text-base font-bold text-on-surface leading-tight line-clamp-2" title={item.title}>
                          {titleCase(item.title)}
                        </h3>
                        <p className="font-label text-[10px] text-outline mt-1.5">{new Date(item.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </Section>
            )}

            <Section title="Community" fullWidth>
              {loading ? (
                <div className="glass-card rounded-xl p-5">
                  <p className="text-xs text-outline">Loading...</p>
                </div>
              ) : communityTopics.length === 0 ? (
                <div className="glass-card rounded-xl p-5 flex items-start gap-4 spring-up" style={{ animationDelay: "0.6s" }}>
                  <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface mb-1">No topics saved by the community yet</p>
                    <p className="text-xs text-outline leading-relaxed">Complete a topic and save it to your collection to be the first!</p>
                  </div>
                </div>
              ) : (
                communityTopics.map((topic, i) => (
                  <div key={topic.topic_id} className="glass-card rounded-xl p-4 flex items-center gap-4 spring-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center border border-white/40">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <Link href={`/learn/${topic.topic_id}/cards?title=${encodeURIComponent(topic.title)}`} className="flex-1 min-w-0">
                      <h3 className="font-heading text-base font-bold text-on-surface truncate" title={topic.title}>
                        {titleCase(topic.title)}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">{topic.save_count} {topic.save_count === 1 ? "person" : "people"} saved this</p>
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
                <div className="glass-card rounded-xl p-5 flex items-start gap-4 spring-up" style={{ animationDelay: "0.5s" }}>
                  <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface mb-1">Type any topic to dive in</p>
                    <p className="text-xs text-outline leading-relaxed">
                      You&apos;ll get smart cards, a quiz, and connected topics to explore next. Complete topics to build your collection.
                    </p>
                  </div>
                </div>
              </Section>
            )}
          </>
        ) : (
          <section>
            <h2 className="font-heading text-xl font-bold text-on-surface mb-4 tracking-tight spring-up">Leaderboard</h2>
            <LeaderboardList />
          </section>
        )}
      </div>

      <HomeNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
