"use client"

import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[#f8f8f8] flex items-center justify-center mb-5 border border-[#f0f0f0]">
        <AlertCircle className="h-6 w-6 text-[#a3a3a3]" />
      </div>
      <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-2">
        Couldn't generate content
      </h2>
      <p className="text-sm text-[#737373] leading-relaxed mb-6 max-w-sm">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 h-11 px-6 bg-[#1a1a1a] text-white rounded-[24px] text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.97]"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  )
}
