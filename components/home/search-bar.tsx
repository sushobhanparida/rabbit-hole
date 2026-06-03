"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const examples = [
  { label: "Why Concorde Failed", query: "concorde" },
  { label: "The Fermi Paradox", query: "fermi-paradox" },
  { label: "How GPS Works", query: "gps" },
]

export function SearchBar() {
  const router = useRouter()
  const [value, setValue] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    const id = slugify(trimmed)
    router.push(`/learn/${id}/cards?title=${encodeURIComponent(trimmed)}`)
  }

  const handleExample = (label: string, query: string) => {
    router.push(`/learn/${query}/cards?title=${encodeURIComponent(label)}`)
  }

  return (
    <div className="mb-10 mt-4">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center animate-border-spin w-full rounded-2xl">
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 h-5 w-5" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="What do you want to learn today?"
            className="w-full h-24 pl-12 pr-32 bg-transparent rounded-2xl border border-transparent focus:outline-none transition-all text-base text-on-surface placeholder:text-outline-variant z-10"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="absolute right-3 px-6 py-3 bg-gradient-to-br from-deep-onyx to-[#2a2411] text-white rounded-full font-label text-xs tracking-[0.1em] uppercase hover:opacity-90 active:scale-95 transition-all shadow-sm btn-glow z-10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Go
          </button>
        </div>
      </form>
      <div className="flex gap-2 mt-4 flex-wrap">
        {examples.map((ex) => (
          <button
            key={ex.query}
            onClick={() => handleExample(ex.label, ex.query)}
            className="shrink-0 px-4 py-2 bg-surface-container-low rounded-full text-sm text-on-surface-variant hover:bg-surface-container transition-colors border border-white/40 font-sans"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}
