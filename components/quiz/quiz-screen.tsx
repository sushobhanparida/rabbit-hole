"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QuizQuestion } from "./quiz-question"
import { QuizQuestion as QuizQuestionType } from "@/lib/types"

interface QuizScreenProps {
  questions: QuizQuestionType[]
  onComplete: (score: number, total: number) => void
}

export function QuizScreen({ questions, onComplete }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [score, setScore] = useState(0)

  const current = questions[currentIndex]

  const handleSelect = (index: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: index }))
    if (index === current.correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      onComplete(score, questions.length)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Progress header */}
      <div className="mb-6">
        <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-[#1a1a1a] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-[#a3a3a3] text-center">
          Quiz {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <QuizQuestion
            key={current.id}
            question={current}
            selectedIndex={answers[current.id]}
            onSelect={handleSelect}
            onNext={handleNext}
            isLast={currentIndex === questions.length - 1}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
