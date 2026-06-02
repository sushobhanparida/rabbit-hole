"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CardContent as CardData } from "@/lib/types"
import { MarkdownRenderer } from "@/components/rich-text/markdown-renderer"
import { CardFooter } from "./card-footer"
import { Check, X, ChevronDown, ChevronUp } from "lucide-react"

import type { NarrationState } from "@/hooks/use-narration"

interface CardContentProps {
  card: CardData
  onAnswer?: (correct: boolean) => void
  showResult?: boolean
  selectedAnswer?: number
  onSelectAnswer?: (index: number) => void
  narrationState?: NarrationState
  onToggleNarration?: () => void
  onRestartNarration?: () => void
}

export function CardContent({ card, onAnswer, showResult, selectedAnswer, onSelectAnswer, narrationState, onToggleNarration, onRestartNarration }: CardContentProps) {
  const [localSelected, setLocalSelected] = useState<number | undefined>(undefined)
  const [revealed, setRevealed] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)

  const selected = selectedAnswer ?? localSelected

  const handleSelect = (index: number) => {
    if (revealed || showResult) return
    if (onSelectAnswer) {
      onSelectAnswer(index)
      return
    }
    setLocalSelected(index)
    setRevealed(true)
    if (onAnswer && card.correctIndex !== undefined) {
      onAnswer(index === card.correctIndex)
    }
  }

  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full reading-width"
    >
      {/* Image */}
      {card.image && !imageError && (
        <div className="w-full rounded-[20px] overflow-hidden mb-4 flex-shrink-0">
          <img
            src={card.image}
            alt={card.imageAlt || card.title}
            className="w-full h-auto max-h-[260px] object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          {card.imageSource && (
            <p className="text-[10px] text-[#a3a3a3] text-right pr-1 pt-1 leading-tight">
              Source:{" "}
              <a
                href={card.imageSource}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#525252]"
              >
                {(() => { try { return new URL(card.imageSource!).hostname.replace("www.", "") } catch { return card.imageSource } })()}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="font-serif text-xl sm:text-xl font-bold text-[#1a1a1a] leading-snug mb-3 flex-shrink-0">
        <MarkdownRenderer content={card.title} />
      </h2>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-4 space-y-4 scrollbar-hide">
        {/* Body */}
        <MarkdownRenderer content={card.body} />

        {/* Fact callout */}
        {card.fact && (
          <div className="bg-[#f8f8f8] rounded-[16px] p-4 border border-[#f0f0f0]">
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-1">
              Did you know?
            </p>
            <div className="text-sm text-[#404040] leading-relaxed italic">
              <MarkdownRenderer content={card.fact} />
            </div>
          </div>
        )}

        {/* Timeline */}
        {card.events && card.events.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
            <div className="flex gap-0 min-w-max">
              {card.events.map((event, i) => (
                <div key={i} className="flex flex-col items-center w-[140px] flex-shrink-0">
                  <div className="text-xs font-semibold text-[#1a1a1a] mb-1">{event.date}</div>
                  <div className="w-0.5 h-8 bg-[#d1d1d1]" />
                  <div className="w-3 h-3 rounded-full bg-[#1a1a1a] -my-1 z-10" />
                  <div className="w-0.5 h-8 bg-[#d1d1d1]" />
                  <p className="text-xs text-[#525252] text-center mt-2 font-medium leading-snug px-1">
                    {event.label}
                  </p>
                  {event.description && (
                    <p className="text-[11px] text-[#a3a3a3] text-center mt-1 leading-snug px-1">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagram labels */}
        {card.diagramLabels && card.diagramLabels.length > 0 && (
          <div className="bg-[#f8f8f8] rounded-[16px] p-4 border border-[#f0f0f0]">
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-3">
              Key Elements
            </p>
            <ul className="space-y-2">
              {card.diagramLabels.map((label, i) => {
                const labelText = typeof label === "string" ? label : String((label as any)?.label || (label as any)?.title || label)
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#525252]">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-medium flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {labelText}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Comparison */}
        {(card.comparisonA || card.comparisonB) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f8f8f8] rounded-[16px] p-4 border border-[#f0f0f0]">
              {card.labelA && (
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-1">
                  {card.labelA}
                </p>
              )}
              <div className="text-sm text-[#404040] leading-snug">
                <MarkdownRenderer content={card.comparisonA || ""} />
              </div>
            </div>
            <div className="bg-[#f8f8f8] rounded-[16px] p-4 border border-[#f0f0f0]">
              {card.labelB && (
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-1">
                  {card.labelB}
                </p>
              )}
              <div className="text-sm text-[#404040] leading-snug">
                <MarkdownRenderer content={card.comparisonB || ""} />
              </div>
            </div>
          </div>
        )}

        {/* Interactive options (prediction, poll, question) */}
        {card.options && card.options.length > 0 && (
          <div className="space-y-2">
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

              const optionLabel = typeof option === "string" ? option : String((option as any)?.label || (option as any)?.title || option)

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={optionClass}
                  disabled={showFeedback && card.correctIndex !== undefined}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{optionLabel}</span>
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

            {/* Explanation after answering */}
            {(revealed || showResult) && card.explanation && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-[#f8f8f8] rounded-[16px] border border-[#f0f0f0]"
              >
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wide font-medium mb-1">
                  {card.correctIndex !== undefined ? "Explanation" : "About this"}
                </p>
                <div className="text-sm text-[#404040] leading-relaxed">
                  <MarkdownRenderer content={card.explanation} />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Sources (only on content cards, not interactive ones) */}
        {!card.options && card.sources && card.sources.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-2 text-xs text-[#a3a3a3] hover:text-[#525252] font-medium transition-colors"
            >
              {sourcesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Sources ({card.sources.length})
            </button>
            {sourcesOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-[#f8f8f8] rounded-[12px] border border-[#f0f0f0] space-y-2"
              >
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
              </motion.div>
            )}
          </div>
        )}
      </div>
      <CardFooter narrationState={narrationState} onToggleNarration={onToggleNarration} onRestartNarration={onRestartNarration} />
    </motion.div>
  )
}
