"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CardContent as CardData } from "@/lib/types"
import { MarkdownRenderer } from "@/components/rich-text/markdown-renderer"
import { Check, X, ChevronDown, ChevronUp } from "lucide-react"

interface CardContentProps {
  card: CardData
  category?: string
  listeningMinutes?: number
  showResult?: boolean
  selectedAnswer?: number
  onSelectAnswer?: (index: number) => void
}

export function CardContent({ card, category, listeningMinutes, showResult, selectedAnswer, onSelectAnswer }: CardContentProps) {
  const [imageError, setImageError] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [localSelected, setLocalSelected] = useState<number | undefined>(undefined)
  const [revealed, setRevealed] = useState(false)
  const selected = selectedAnswer ?? localSelected

  const handleSelect = (index: number) => {
    if (revealed || showResult) return
    if (onSelectAnswer) {
      onSelectAnswer(index)
      return
    }
    setLocalSelected(index)
    setRevealed(true)
  }

  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="reading-width space-y-4">
          {/* Image */}
          {card.image && !imageError && (
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative group">
              <img
                src={card.image}
                alt={card.imageAlt || card.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay pointer-events-none" />
            </div>
          )}

          {/* Category badge */}
          {category && (
            <p className="font-label text-[10px] tracking-[0.2em] text-primary uppercase">
              {category}
            </p>
          )}

          {/* Title */}
          <h2 className="font-heading text-xl font-bold text-on-surface leading-snug">
            <MarkdownRenderer content={card.title} />
          </h2>

          {/* Body */}
          <MarkdownRenderer content={card.body} />

          {/* Quiz options */}
          {card.options && card.options.length > 0 && (
            <div className="space-y-2 pt-2">
              {card.options.map((option, i) => {
                const isSelected = selected === i
                const isCorrect = card.correctIndex !== undefined && i === card.correctIndex
                const showFeedback = revealed || showResult

                let optionClass = "w-full text-left p-4 rounded-[16px] border text-sm transition-all duration-200 active:scale-[0.98]"

                if (showFeedback && card.correctIndex !== undefined) {
                  if (isCorrect) {
                    optionClass += " border-green-300 bg-green-50 text-green-800"
                  } else if (isSelected && !isCorrect) {
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
                    onClick={() => !showFeedback && handleSelect(i)}
                    className={optionClass}
                    disabled={showFeedback && card.correctIndex !== undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{option}</span>
                      {showFeedback && card.correctIndex !== undefined && isCorrect && (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {showFeedback && card.correctIndex !== undefined && isSelected && !isCorrect && (
                        <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}

              {(revealed || showResult) && card.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-[#f8f8f8] rounded-[16px] border border-[#f0f0f0]"
                >
                  <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-1">Explanation</p>
                  <div className="text-sm text-[#404040] leading-relaxed">
                    <MarkdownRenderer content={card.explanation} />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div className="h-2 shrink-0" />
        </div>
      </div>

      {/* Sources pinned to bottom */}
      {card.sources && card.sources.length > 0 && (
        <div className="shrink-0 border-t border-[#f0f0f0] pt-3 pb-1 px-1">
          <button
            onClick={() => setSourcesOpen(!sourcesOpen)}
            className="flex items-center gap-2 text-xs text-[#a3a3a3] hover:text-[#525252] font-medium transition-colors"
          >
            {sourcesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Sources ({card.sources.length})
          </button>
          {sourcesOpen && (
            <div className="mt-2 space-y-2">
              {card.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#525252] hover:text-[#1a1a1a] hover:underline underline-offset-2 leading-snug"
                >
                  {s.favicon && (
                    <img src={s.favicon} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0" />
                  )}
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
