"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CardContent as CardDataType } from "@/lib/types"
import { CardContent } from "./card-content"
import { CardHeader } from "./card-header"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface CardDeckProps {
  cards: CardDataType[]
  currentIndex: number
  onNext: () => void
  onBack: () => void
  onFinish: () => void
}

export function CardDeck({ cards, currentIndex, onNext, onBack, onFinish }: CardDeckProps) {
  const currentCard = cards[currentIndex]
  const [dragX, setDragX] = useState(0)
  const isFirstCard = currentIndex === 0
  const isLastCard = currentIndex >= cards.length - 1

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 80
    if (info.offset.x < -threshold) {
      if (isLastCard) {
        onFinish()
      } else {
        onNext()
      }
    }
    setDragX(0)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      <CardHeader current={currentIndex} total={cards.length} />

      <div className="flex-1 flex items-stretch justify-center px-5 pb-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            onDrag={(_, info) => setDragX(info.offset.x)}
            className="w-full max-w-[400px] bg-white rounded-[24px] p-6 shadow-elevate border border-[#f0f0f0] cursor-grab active:cursor-grabbing touch-pan-y flex flex-col"
          >
            <CardContent card={currentCard} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 mt-4 mb-8">
        <button
          onClick={onBack}
          disabled={isFirstCard}
          className="flex items-center gap-2 h-11 px-5 border border-[#e4e4e4] rounded-[24px] text-sm font-medium text-[#525252] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={isLastCard ? onFinish : onNext}
          className="flex items-center gap-2 h-11 px-5 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97]"
        >
          {isLastCard ? "Finish" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
