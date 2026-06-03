"use client"

import { motion } from "framer-motion"
import { QuizQuestion as QuizQuestionType } from "@/lib/types"
import { MarkdownRenderer } from "@/components/rich-text/markdown-renderer"
import { Check, X } from "lucide-react"

interface QuizQuestionProps {
  question: QuizQuestionType
  selectedIndex: number | undefined
  onSelect: (index: number) => void
  onNext: () => void
  isLast: boolean
}

export function QuizQuestion({ question, selectedIndex, onSelect, onNext, isLast }: QuizQuestionProps) {
  const isCorrect = selectedIndex === question.correctIndex
  const hasAnswered = selectedIndex !== undefined

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Question */}
      <h3 className="font-heading text-xl font-bold text-on-surface mb-6 leading-snug">
        <MarkdownRenderer content={question.question} />
      </h3>

      {/* Options */}
      <div className="space-y-2 mb-6">
        {question.options.map((option, i) => {
          const optionLabel = typeof option === "string" ? option : String((option as any)?.label || (option as any)?.title || option)
          const isSelected = selectedIndex === i
          const isRight = i === question.correctIndex

          let optionClass = "w-full text-left p-4 rounded-[16px] border text-sm transition-all duration-200 active:scale-[0.98]"

          if (hasAnswered) {
            if (isRight) {
              optionClass += " border-green-300 bg-green-50 text-green-800"
            } else if (isSelected && !isRight) {
              optionClass += " border-red-300 bg-red-50 text-red-800"
            } else {
              optionClass += " border-[#e4e4e4] bg-white text-[#404040] opacity-50"
            }
          } else if (isSelected) {
            optionClass += " border-[#1a1a1a] bg-[#f8f8f8] text-[#1a1a1a]"
          } else {
            optionClass += " border-[#e4e4e4] bg-white text-[#404040] hover:border-[#1a1a1a] hover:bg-[#f8f8f8]"
          }

          return (
            <button
              key={i}
              onClick={() => !hasAnswered && onSelect(i)}
              className={optionClass}
              disabled={hasAnswered}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{optionLabel}</span>
                {hasAnswered && isRight && (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
                {hasAnswered && isSelected && !isRight && (
                  <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {hasAnswered && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[#f8f8f8] rounded-[16px] border border-[#f0f0f0]"
        >
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-1">Explanation</p>
          <div className="text-sm text-[#404040] leading-relaxed">
            <MarkdownRenderer content={question.explanation} />
          </div>
        </motion.div>
      )}

      {/* Next / Finish button */}
      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={onNext}
            className="w-full h-12 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.98]"
          >
            {isLast ? "See Results" : "Next Question"}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
