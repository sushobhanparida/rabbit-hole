"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { CardContent, LearningFlow, ConnectedTopic } from "./types"
import { syncProgress, syncRecentTopic, syncFlow, syncUserXp, syncProfileTopics } from "./supabase/sync"

export type FlowPhase = "generating" | "error" | "learning" | "quiz" | "completed"

interface LearningSession {
  topicId: string
  topicTitle: string
  flow: LearningFlow | null
  phase: FlowPhase
  currentCardIndex: number
  errorMessage: string
  quizScore: number
  quizTotal: number
  quizXpValues: number[]
  totalCards: number
  maxCardReached: number
  startTime: number
  xpBreakdown?: XpBreakdown
}

interface XpBreakdown {
  quizXp: number
  completionXp: number
  coverageXp: number
  total: number
}

interface UserProfile {
  id: string
  email: string
  password: string
  name: string
}

interface CollectionItem {
  topicId: string
  title: string
  completedAt: string
  score: number
  total: number
}

interface AppState {
  // User
  user: UserProfile | null

  // Progress tracking
  xp: number
  completedTopics: string[]
  recentTopics: string[]
  collection: CollectionItem[]

  // Cached flows (persisted — no re-generation on revisit)
  flowCache: Record<string, LearningFlow>

  // Current session
  session: LearningSession

  // Actions
  login: (id: string, email: string, password: string, name: string) => void
  logout: () => void
  addToCollection: (topicId: string, title: string, score: number, total: number) => void
  addXp: (amount: number) => void
  markTopicCompleted: (topicId: string) => void
  addRecentTopic: (topicId: string) => void
  startGeneration: (topicId: string, topicTitle: string) => void
  setFlow: (flow: LearningFlow) => void
  setError: (message: string) => void
  retry: () => void
  nextCard: () => void
  prevCard: () => void
  startQuiz: () => void
  recordQuizScore: (score: number, total: number) => void
  completeSession: () => void
  resetSession: () => void
  cacheFlow: (topicId: string, flow: LearningFlow) => void
}

const defaultSession: LearningSession = {
  topicId: "",
  topicTitle: "",
  flow: null,
  phase: "generating",
  currentCardIndex: 0,
  errorMessage: "",
  quizScore: 0,
  quizTotal: 0,
  quizXpValues: [],
  totalCards: 0,
  maxCardReached: 0,
  startTime: 0,
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      xp: 0,
      completedTopics: [],
      recentTopics: [],
      collection: [],
      flowCache: {},
      session: { ...defaultSession },

      // Actions
      login: (id: string, email: string, password: string, name: string) =>
        set(() => ({ user: { id, email, password, name } })),

      logout: () => set(() => ({ user: null })),

      addToCollection: (topicId, title, score, total) =>
        set((s) => {
          if (s.collection.some((c) => c.topicId === topicId)) return s
          if (s.user?.id) {
            fetch("/api/sync/collection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: s.user.id, topicId, title, score, total }),
            }).catch(() => {})
          }
          return {
            collection: [
              ...s.collection,
              { topicId, title, completedAt: new Date().toISOString(), score, total },
            ],
          }
        }),

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      markTopicCompleted: (topicId) =>
        set((s) => ({
          completedTopics: s.completedTopics.includes(topicId)
            ? s.completedTopics
            : [...s.completedTopics, topicId],
        })),

      addRecentTopic: (topicId) =>
        set((s) => {
          if (s.user?.id) {
            syncRecentTopic(s.user.id, topicId, s.session.topicTitle || topicId)
          }
          return {
            recentTopics: [topicId, ...s.recentTopics.filter((t) => t !== topicId)].slice(0, 10),
          }
        }),

      startGeneration: (topicId, topicTitle) =>
        set((s) => {
          const cached = s.flowCache[topicId]
          if (cached) {
            return {
              session: {
                ...defaultSession,
                topicId,
                topicTitle,
                phase: "learning",
                flow: cached,
              },
            }
          }
          return {
            session: {
              ...defaultSession,
              topicId,
              topicTitle,
              phase: "generating",
            },
          }
        }),

      setFlow: (flow) =>
        set((s) => {
          const isFresh = !s.session.flow
          return {
            session: {
              ...s.session,
              flow,
              phase: "learning",
              totalCards: flow.cards.length + (flow.quiz?.questions?.length || 0),
              ...(isFresh ? {
                currentCardIndex: 0,
                maxCardReached: 0,
                startTime: Date.now(),
              } : {}),
            },
          }
        }),

      setError: (message) =>
        set((s) => ({
          session: { ...s.session, phase: "error", errorMessage: message },
        })),

      retry: () =>
        set((s) => ({
          session: { ...s.session, phase: "generating", errorMessage: "" },
        })),

      nextCard: () =>
        set((s) => {
          const nextIndex = s.session.currentCardIndex + 1
          return {
            session: {
              ...s.session,
              currentCardIndex: nextIndex,
              maxCardReached: Math.max(s.session.maxCardReached, nextIndex),
            },
          }
        }),

      prevCard: () =>
        set((s) => ({
          session: {
            ...s.session,
            currentCardIndex: Math.max(0, s.session.currentCardIndex - 1),
          },
        })),

      startQuiz: () =>
        set((s) => ({
          session: { ...s.session, phase: "quiz", quizScore: 0, quizTotal: 0 },
        })),

      recordQuizScore: (score, total) =>
        set((s) => {
          const values: number[] = []
          for (let i = 0; i < total; i++) {
            const base = 8 + Math.floor(Math.random() * 15)
            values.push(i < score ? base : 0)
          }
          return {
            session: { ...s.session, quizScore: score, quizTotal: total, quizXpValues: values },
          }
        }),

      completeSession: () =>
        set((s) => {
          const { quizScore, quizTotal, quizXpValues, maxCardReached, totalCards, topicId, topicTitle } = s.session
          const rawQuizXp = quizXpValues.reduce((a, b) => a + b, 0)
          const perfect = quizScore >= quizTotal && quizTotal > 0
          const quizXp = perfect ? Math.round(rawQuizXp * 1.5) : rawQuizXp
          const coverageRatio = totalCards > 0 ? maxCardReached / totalCards : 0
          const coverageXp = Math.round(coverageRatio * 50)
          const completionXp = maxCardReached >= totalCards - 1 ? 30 : 0
          const total = quizXp + coverageXp + completionXp
          const xpBreakdown = { quizXp, coverageXp, completionXp, total }

          const newXp = s.xp + total
          const completedCount = s.completedTopics.includes(topicId) ? s.completedTopics.length : s.completedTopics.length + 1

          if (s.user?.id) {
            syncProgress(s.user.id, {
              topicId,
              topicTitle,
              completed: true,
              cardsViewed: maxCardReached,
              totalCards,
              quizScore,
              quizTotal,
              xpEarned: total,
              xpBreakdown,
              quizXpValues,
            })
            syncUserXp(s.user.id, newXp)
            syncProfileTopics(s.user.id, completedCount)
          }

          const alreadyInCollection = s.collection.some((c) => c.topicId === topicId)
          const newCollection = alreadyInCollection
            ? s.collection
            : [...s.collection, { topicId, title: topicTitle || topicId, completedAt: new Date().toISOString(), score: quizScore, total: quizTotal }]

          if (s.user?.id && !alreadyInCollection) {
            fetch("/api/sync/collection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: s.user.id, topicId, title: topicTitle || topicId, score: quizScore, total: quizTotal }),
            }).catch(() => {})
          }

          return {
            xp: newXp,
            completedTopics: s.completedTopics.includes(topicId)
              ? s.completedTopics
              : [...s.completedTopics, topicId],
            recentTopics: [
              topicId,
              ...s.recentTopics.filter((t) => t !== topicId),
            ].slice(0, 10),
            collection: newCollection,
            session: {
              ...s.session,
              phase: "completed",
              totalCards,
              xpBreakdown,
            },
          }
        }),

      resetSession: () =>
        set(() => ({
          session: { ...defaultSession },
        })),

      cacheFlow: (topicId, flow) =>
        set((s) => {
          syncFlow({
            topicId,
            topicTitle: s.session.topicTitle || topicId,
            cards: flow.cards,
            quiz: flow.quiz,
            connectedTopics: flow.connectedTopics,
            source: "template",
          })
          return {
            flowCache: { ...s.flowCache, [topicId]: flow },
          }
        }),
    }),
    {
      name: "rabbit-hole-store",
      partialize: (state) => ({
        user: state.user,
        xp: state.xp,
        completedTopics: state.completedTopics,
        recentTopics: state.recentTopics,
        collection: state.collection,
        flowCache: state.flowCache,
      }),
    }
  )
)
