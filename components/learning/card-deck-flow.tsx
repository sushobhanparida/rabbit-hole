"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/lib/store"
import { generateInstantFlow } from "@/lib/generator"
import { topics } from "@/lib/mock-data"
import type { CardContent as CardData, LearningFlow } from "@/lib/types"
import { CardContent } from "./card-content"
import { CardFooter } from "./card-footer"
import { CardHeader } from "./card-header"
import { LoadingState } from "@/components/generation/loading-state"
import { ErrorState } from "@/components/generation/error-state"
import { CompletionScreen } from "@/components/completion/completion-screen"
import { useNarration } from "@/hooks/use-narration"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CardDeckFlowProps {
  initialTitle?: string
}

export function CardDeckFlow({ initialTitle }: CardDeckFlowProps) {
  const params = useParams()
  const topicId = params.topicId as string

  const topic = topics.find((t) => t.id === topicId)
  const title = topic?.title || initialTitle || topicId
  const description = topic?.description || `Learn about ${title}`

  const session = useStore((s) => s.session)
  const startGeneration = useStore((s) => s.startGeneration)
  const setFlow = useStore((s) => s.setFlow)
  const setError = useStore((s) => s.setError)
  const retry = useStore((s) => s.retry)
  const nextCard = useStore((s) => s.nextCard)
  const prevCard = useStore((s) => s.prevCard)
  const recordQuizScore = useStore((s) => s.recordQuizScore)
  const completeSession = useStore((s) => s.completeSession)
  const resetSession = useStore((s) => s.resetSession)
  const cacheFlow = useStore((s) => s.cacheFlow)
  const addRecentTopic = useStore((s) => s.addRecentTopic)
  const router = useRouter()

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizCards, setQuizCards] = useState<CardData[]>([])

  const buildQuizCards = useCallback((questions: { questions: { id: string; question: string; options: string[]; correctIndex: number; explanation: string }[] }) => {
    return questions.questions.map((q, i) => {
      const valid = q.options?.map((o, idx) => ({ text: o, origIdx: idx })).filter((o) => o.text && o.text !== "NaN" && o.text !== "undefined" && o.text !== "null")
      const validOptions = valid?.map((o) => o.text) || []
      const correctIndex = validOptions.length >= 2 ? valid.findIndex((o) => o.origIdx === q.correctIndex) : 0
      return {
        id: `quiz-${q.id || i}`,
        title: `Quiz ${i + 1}`,
        body: q.question && !q.question.includes("NaN") ? q.question : `What did you learn about this topic?`,
        options: validOptions.length >= 2 ? validOptions : ["It was covered in the cards", "It was not mentioned", "I need to review again", "I understand it well"],
        correctIndex: validOptions.length >= 2 ? Math.max(0, correctIndex) : 0,
        explanation: q.explanation && !q.explanation.includes("NaN") ? q.explanation : "Review the cards above to test your understanding.",
      }
    })
  }, [])
  const [dragX, setDragX] = useState(0)
  const generating = useRef(false)
  const { state: narrationState, toggle: toggleNarration, restart: restartNarration, stop: stopNarration } = useNarration()

  const handleExit = useCallback(() => {
    if (session.flow) {
      cacheFlow(session.topicId, session.flow)
    }
    addRecentTopic(session.topicId)
    stopNarration()
    router.push("/")
  }, [session, cacheFlow, addRecentTopic, router, stopNarration])

  // Suppress body scroll while on cards page
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // Stop narration when card changes
  useEffect(() => {
    stopNarration()
  }, [session.currentCardIndex])

  useEffect(() => {
    const cached = useStore.getState().flowCache[topicId]
    if (cached) {
      startGeneration(topicId, title)
      setQuizCards(buildQuizCards(cached.quiz))
      return
    }

    startGeneration(topicId, title)
    generating.current = true

    const load = async () => {
      const instant = await generateInstantFlow(topicId, title, description)
      if (!generating.current) return

      if (instant.data) {
        setFlow(instant.data)
        cacheFlow(topicId, instant.data)
        setQuizCards(buildQuizCards(instant.data.quiz))

        // Fetch category in background — non-blocking
        fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, topicId }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.category) {
              useStore.getState().setCategory?.(data.category)
            }
          })
          .catch(() => {})
      } else {
        setError(instant.error || "Failed to generate content")
      }

      generating.current = false
    }

    load()

    // Cleanup on unmount
    return () => { generating.current = false }
  }, [topicId, title, description, session.retryCount])

  const allCards = useMemo((): CardData[] => {
    if (!session.flow) return []
    return [...session.flow.cards, ...quizCards]
  }, [session.flow, quizCards])

  const learningCardCount = session.flow?.cards.length ?? 0

  const finishWithCompletion = useCallback(() => {
    const quizCardCount = allCards.length - learningCardCount
    let score = 0
    let lastCorrect = false
    for (let i = 0; i < quizCardCount; i++) {
      const card = allCards[learningCardCount + i]
      const isCorrect = quizAnswers[card.id] === card.correctIndex
      if (isCorrect) score++
      if (i === quizCardCount - 1) lastCorrect = isCorrect
    }
    recordQuizScore(score, quizCardCount, lastCorrect)
    completeSession()
  }, [allCards, learningCardCount, quizAnswers, recordQuizScore, completeSession])

  const handleNext = () => {
    const nextIndex = session.currentCardIndex + 1
    if (nextIndex >= allCards.length) {
      finishWithCompletion()
    } else {
      nextCard()
    }
  }

  const handleQuizSelect = (cardId: string, index: number) => {
    setQuizAnswers((prev) => ({ ...prev, [cardId]: index }))
  }

  if (session.phase === "generating") {
    return <LoadingState stage="generating" onTimeoutRetry={retry} />
  }

  if (session.phase === "error") {
    return <ErrorState message={session.errorMessage} onRetry={retry} />
  }

  if (session.phase === "learning" && session.flow) {
    const currentCard = allCards[session.currentCardIndex]
    if (!currentCard) return null

    const isFirstCard = session.currentCardIndex === 0
    const isLastCard = session.currentCardIndex >= allCards.length - 1
    const isQuizCard = session.currentCardIndex >= learningCardCount
    const quizAnswered = !isQuizCard || quizAnswers[currentCard.id] !== undefined
    const canGoNext = quizAnswered
    const narrationText = `${currentCard.title}. ${currentCard.body}`
    const listeningMinutes = Math.max(1, Math.ceil(narrationText.replace(/[[\]()*_#`>|:-]/g, "").slice(0, 3000).length / 600))

    const handleDragEnd = (_: any, info: any) => {
      if (!canGoNext) return
      const threshold = 80
      if (info.offset.x < -threshold) {
        if (isLastCard) {
          finishWithCompletion()
        } else {
          handleNext()
        }
      }
      setDragX(0)
    }

    return (
      <div className="fixed inset-0 flex flex-col bg-gradient-card-deck overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-primary-container/30 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[250px] h-[250px] rounded-full bg-secondary-container/20 blur-[80px] pointer-events-none" />

        <CardHeader current={session.currentCardIndex} total={allCards.length} onClose={handleExit} />

        <div className="flex-1 flex flex-col px-5 pt-20 pb-28 overflow-hidden">
          <div className="flex-1 min-h-0 flex items-stretch justify-center relative">
            {/* Next card peek — visible behind the active card */}
            <div className="absolute inset-0 flex items-stretch justify-center pointer-events-none">
              <div className="w-full max-w-[400px] rounded-2xl bg-white/30 border border-white/40 opacity-40 scale-[0.97] translate-y-1" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, x: 50, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, y: 10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                onDrag={(_, info) => setDragX(info.offset.x)}
                className="w-full max-w-[400px] glass-card rounded-2xl p-6 cursor-grab active:cursor-grabbing touch-pan-y flex flex-col overflow-hidden relative shadow-[0_8px_32px_-8px_rgba(13,13,13,0.08)]"
              >
                  <CardContent
                    card={currentCard}
                    category={session.flow.category}
                    listeningMinutes={listeningMinutes}
                    selectedAnswer={quizAnswers[currentCard.id]}
                    showResult={quizAnswers[currentCard.id] !== undefined}
                    onSelectAnswer={
                      isQuizCard ? (idx) => handleQuizSelect(currentCard.id, idx) : undefined
                    }
                  />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[400px] max-w-[calc(100vw-40px)] pointer-events-none">
          <div className="flex items-end justify-between gap-2">
            <CardFooter narrationState={narrationState} onToggleNarration={() => toggleNarration(narrationText)} onRestartNarration={() => restartNarration()} listeningMinutes={listeningMinutes} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => prevCard()}
                disabled={isFirstCard}
                className="w-9 h-9 rounded-full bg-[#0D0D0D] flex items-center justify-center pointer-events-auto text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-all active:scale-[0.92]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={isLastCard ? finishWithCompletion : handleNext}
                disabled={!canGoNext}
                className={`w-9 h-9 rounded-full flex items-center justify-center pointer-events-auto transition-all active:scale-[0.92] ${
                  canGoNext
                    ? "bg-[#0D0D0D] text-white hover:bg-[#1a1a1a]"
                    : "bg-[#f0f0f0] text-[#a3a3a3] cursor-not-allowed"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (session.phase === "completed" && session.flow) {
    return (
      <CompletionScreen
        topicId={session.topicId}
        topicTitle={session.topicTitle}
        score={session.quizScore}
        total={session.quizTotal}
        connectedTopics={session.flow.connectedTopics}
        onRestart={() => { resetSession(); router.push("/") }}
      />
    )
  }

  return null
}
