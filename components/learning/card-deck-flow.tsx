"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/lib/store"
import { generateInstantFlow, generateCards, generateQuiz } from "@/lib/generator"
import { topics } from "@/lib/mock-data"
import type { CardContent as CardData, LearningFlow } from "@/lib/types"
import { CardContent } from "./card-content"
import { CardHeader } from "./card-header"
import { LoadingState } from "@/components/generation/loading-state"
import { ErrorState } from "@/components/generation/error-state"
import { CompletionScreen } from "@/components/completion/completion-screen"
import { useNarration } from "@/hooks/use-narration"
import { ArrowLeft, ArrowRight, X } from "lucide-react"

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

  const [loadingStage, setLoadingStage] = useState<"research" | "generating">("research")
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizCards, setQuizCards] = useState<CardData[]>([])

  const buildQuizCards = useCallback((questions: { questions: { id: string; question: string; options: string[]; correctIndex: number; explanation: string }[] }) => {
    return questions.questions.map((q, i) => {
      const valid = q.options?.map((o, idx) => ({ text: o, origIdx: idx })).filter((o) => o.text && o.text !== "NaN" && o.text !== "undefined" && o.text !== "null")
      const validOptions = valid?.map((o) => o.text) || []
      const correctIndex = validOptions.length >= 2 ? valid.findIndex((o) => o.origIdx === q.correctIndex) : 0
      return {
        id: `quiz-${q.id || i}`,
        type: "question" as const,
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

    setLoadingStage("research")
    startGeneration(topicId, title)

    generating.current = true

    const load = async () => {
      // Phase 1: instant template content (3-5 seconds)
      const instant = await generateInstantFlow(topicId, title, description)
      if (instant.data) {
        setFlow(instant.data)
        cacheFlow(topicId, instant.data)
        setQuizCards(buildQuizCards(instant.data.quiz))
      }
      if (!generating.current) return

      // Phase 2: try NVIDIA for enhanced cards (background — non-critical)
      setLoadingStage("generating")
      try {
        const cardsResult = await generateCards(topicId, title, description)
        const templateCardCount = useStore.getState().session.flow?.cards.length || 0
        if (cardsResult.data && cardsResult.data.cards.length >= templateCardCount && generating.current) {
          const currentFlow = useStore.getState().session.flow
          const enhancedFlow: LearningFlow = {
            cards: cardsResult.data.cards,
            connectedTopics: cardsResult.data.connectedTopics,
            quiz: currentFlow?.quiz || { questions: [] },
            topicId,
          }
          setFlow(enhancedFlow)

          // Phase 3: generate quiz in background
          try {
            const cardBodies = cardsResult.data.cards.map((c) => `- ${c.title || "Card"}: ${(c.body || "").slice(0, 200)}`).join("\n")
            const quizResult = await generateQuiz(title, cardBodies)
            if (quizResult.data?.questions && generating.current) {
              const finalFlow = useStore.getState().session.flow
              if (finalFlow) {
                const fullFlow: LearningFlow = { ...finalFlow, quiz: { questions: quizResult.data.questions } }
                setFlow(fullFlow)
                cacheFlow(topicId, fullFlow)
              }
              setQuizCards(buildQuizCards(quizResult.data))
            }
          } catch {
            // Quiz generation failed — template quiz is fine
          }
        }
      } catch {
        // NVIDIA failed — template content is already showing
      }

      // Cache whatever we have
      if (!useStore.getState().flowCache[topicId]) {
        const currentFlow = useStore.getState().session.flow
        if (currentFlow) cacheFlow(topicId, currentFlow)
      }
      generating.current = false
    }

    load()
  }, [topicId, title, description])

  const allCards = useMemo((): CardData[] => {
    if (!session.flow) return []
    return [...session.flow.cards, ...quizCards]
  }, [session.flow, quizCards])

  const learningCardCount = session.flow?.cards.length ?? 0

  const finishWithCompletion = useCallback(() => {
    const quizCardCount = allCards.length - learningCardCount
    let score = 0
    for (let i = 0; i < quizCardCount; i++) {
      const card = allCards[learningCardCount + i]
      if (quizAnswers[card.id] === card.correctIndex) {
        score++
      }
    }
    recordQuizScore(score, quizCardCount)
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
    return <LoadingState stage={loadingStage} />
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
      <div className="fixed inset-0 flex flex-col px-5 pt-6 pb-24 overflow-hidden">
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#737373] hover:bg-[#1a1a1a] hover:text-white transition-colors active:scale-[0.92]"
        >
          <X className="h-4 w-4" />
        </button>
        <CardHeader current={session.currentCardIndex} total={allCards.length} />

        <div className="flex-1 min-h-0 flex items-stretch justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              onDrag={(_, info) => setDragX(info.offset.x)}
              className="w-full max-w-[400px] bg-white rounded-[24px] p-6 shadow-elevate border border-[#f0f0f0] cursor-grab active:cursor-grabbing touch-pan-y flex flex-col overflow-hidden"
            >
              <CardContent
                card={currentCard}
                selectedAnswer={quizAnswers[currentCard.id]}
                showResult={quizAnswers[currentCard.id] !== undefined}
                onSelectAnswer={
                  isQuizCard ? (idx) => handleQuizSelect(currentCard.id, idx) : undefined
                }
                narrationState={narrationState}
                onToggleNarration={() => toggleNarration(narrationText)}
                onRestartNarration={() => restartNarration()}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#f0f0f0] flex items-center justify-between gap-4 px-5 py-3">
          <div className="max-w-[400px] w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => prevCard()}
            disabled={isFirstCard}
            className="flex items-center gap-2 h-11 px-5 border border-[#e4e4e4] rounded-[24px] text-sm font-medium text-[#525252] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={isLastCard ? finishWithCompletion : handleNext}
            disabled={!canGoNext}
            className={`flex items-center gap-2 h-11 px-5 rounded-[24px] text-sm font-medium transition-colors active:scale-[0.97] ${
              canGoNext
                ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
                : "bg-[#f0f0f0] text-[#a3a3a3] cursor-not-allowed"
            }`}
          >
            {isLastCard ? "See Results" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
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
        onRestart={resetSession}
      />
    )
  }

  return null
}
