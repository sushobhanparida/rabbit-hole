"use client"

import { HomeHeader } from "@/components/home/header"
import { SearchBar } from "@/components/home/search-bar"
import { Section } from "@/components/home/section"
import { VoteButtons } from "@/components/home/vote-buttons"
import { HomeNav } from "@/components/home/home-nav"
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { Sparkles, Users, Lightbulb, Rocket, Globe, Atom, Satellite, Microscope, Telescope, FlaskConical } from "lucide-react"
import { classifyByKeywords } from "@/lib/categories"
import { useEffect, useState } from "react"

interface SavedUser {
  name: string
  initials: string
}

interface CommunityTopic {
  topic_id: string
  title: string
  save_count: number
  vote_score: number
  user_vote: number | null
  saved_users?: SavedUser[]
  saved_by_name?: string
}

export default function HomePage() {
  const collection = useStore((s) => s.collection)
  const user = useStore((s) => s.user)
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home")
  const [communityTopics, setCommunityTopics] = useState<CommunityTopic[]>([])
  const [loading, setLoading] = useState(true)

  const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

  const scienceIcons = [Rocket, Globe, Atom, Satellite, Microscope, Telescope, FlaskConical]

  const iconColors = [
    { icon: "text-violet-400/60", bg: "bg-violet-50" },
    { icon: "text-emerald-400/60", bg: "bg-emerald-50" },
    { icon: "text-amber-400/60", bg: "bg-amber-50" },
    { icon: "text-rose-400/60", bg: "bg-rose-50" },
    { icon: "text-cyan-400/60", bg: "bg-cyan-50" },
    { icon: "text-orange-400/60", bg: "bg-orange-50" },
    { icon: "text-sky-400/60", bg: "bg-sky-50" },
  ]

  const getIconStyle = (title: string) => {
    let hash = 0
    for (let i = 0; i < title.length; i++) {
      hash = ((hash << 5) - hash) + title.charCodeAt(i)
      hash |= 0
    }
    const idx = Math.abs(hash) % iconColors.length
    return { Icon: scienceIcons[idx % scienceIcons.length], ...iconColors[idx] }
  }

  const getIconForTitle = (title: string) => {
    let hash = 0
    for (let i = 0; i < title.length; i++) {
      hash = ((hash << 5) - hash) + title.charCodeAt(i)
      hash |= 0
    }
    return scienceIcons[Math.abs(hash) % scienceIcons.length]
  }

  const getCategory = (title: string, topicId?: string) => {
    return classifyByKeywords(title, topicId) || "EXPLORE"
  }

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
      <div>
        <SearchBar />

        {activeTab === "home" ? (
          <>
            {collection.length > 0 && (
              <Section title="My Collection">
                {collection.map((item, i) => (
                  <Link key={item.topicId} href={`/learn/${item.topicId}/cards?title=${encodeURIComponent(item.title)}`} className="block spring-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                    <div className="glass-card rounded-2xl w-56 shrink-0 p-4 flex flex-col justify-between min-h-[180px] cursor-pointer">
                      <div>
                        <div className="w-9 h-9 rounded-full bg-primary-container/50 flex items-center justify-center mb-3">
                          {(() => { const Icon = getIconForTitle(item.title); return <Icon className="h-[18px] w-[18px] text-primary" /> })()}
                        </div>
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-label text-[10px] tracking-[0.1em] uppercase text-primary">{item.category || getCategory(item.title, item.topicId)}</span>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-label bg-green-100 text-green-700 uppercase tracking-wider flex items-center gap-0.5">
                            <span>✓</span> Completed
                          </span>
                        </div>
                        <h3 className="font-heading text-sm font-bold text-on-surface leading-tight line-clamp-2" title={item.title}>
                          {titleCase(item.title)}
                        </h3>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1 bg-primary-container/30 rounded-full overflow-hidden">
                          <div
                            className="h-full progress-shimmer rounded-full"
                            style={{ width: `${(item.totalCards || 0) > 0 ? ((item.cardsViewed || 0) / (item.totalCards || 1)) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="font-label text-[10px] text-outline">{new Date(item.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </Section>
            )}

            {collection.length === 0 && (
              <Section title="Getting Started" fullWidth>
                <div className="glass-card rounded-xl p-5 flex items-start gap-4 spring-up" style={{ animationDelay: "0.5s" }}>
                  <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface mb-1">Type any topic to dive in</p>
                    <p className="text-xs text-outline leading-relaxed">
                      Dive into any topic with smart cards, quizzes, and connected rabbit holes. Complete topics to earn XP and climb the leaderboard.
                    </p>
                  </div>
                </div>
              </Section>
            )}

            <Section title="Community" fullWidth>
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-surface-container" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-3.5 w-32 bg-surface-container rounded" />
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-surface-container" />
                          <div className="h-4 w-4 rounded-full bg-surface-container" />
                          <div className="h-2.5 w-20 bg-surface-container rounded" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-px">
                        <div className="w-6 h-6 rounded-full bg-surface-container" />
                        <div className="h-2.5 w-4 bg-surface-container rounded" />
                        <div className="w-6 h-6 rounded-full bg-surface-container" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : communityTopics.length === 0 ? (
                <div className="glass-card rounded-xl px-4 py-3 flex items-start gap-3 spring-up" style={{ animationDelay: "0.6s" }}>
                  <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface mb-1">No topics saved by the community yet</p>
                    <p className="text-xs text-outline leading-relaxed">Complete a topic and save it to your collection to be the first!</p>
                  </div>
                </div>
              ) : (
                communityTopics.map((topic, i) => (
                  <div key={topic.topic_id} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 spring-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-white/40">
                      {(() => { const { Icon, icon, bg } = getIconStyle(topic.title); return <div className={`${bg} w-full h-full rounded-xl flex items-center justify-center`}><Icon className={`h-5 w-5 ${icon}`} /></div> })()}
                    </div>
                    <Link href={`/learn/${topic.topic_id}/cards?title=${encodeURIComponent(topic.title)}`} className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-bold text-on-surface truncate" title={topic.title}>
                        {titleCase(topic.title)}
                      </h3>
                      {/* Avatar stack */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex">
                          {topic.saved_users?.slice(0, 3).map((u, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-[8px] font-label font-bold text-primary -ml-1 first:ml-0 border border-white"
                              title={u.name}
                            >
                              {u.initials}
                            </div>
                          ))}
                          {topic.save_count > 3 && (
                            <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[8px] font-label text-outline -ml-1 border border-white">
                              +{topic.save_count - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant">
                          {topic.saved_by_name && (
                            <span className="font-label text-[11px] text-outline">{topic.saved_by_name.toLowerCase().replace(/\s/g, "")} · </span>
                          )}
                          {topic.save_count} {topic.save_count === 1 ? "read" : "read this"}
                        </p>
                      </div>
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
