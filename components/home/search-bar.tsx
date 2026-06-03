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
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    const id = slugify(trimmed)
    router.push(`/learn/${id}/cards?title=${encodeURIComponent(trimmed)}`)
  }

  const handleExample = (label: string, query: string) => {
    setValue(label)
  }

  return (
    <div className="mb-10 mt-4">
      <form onSubmit={handleSubmit}>
        <div
          className={`relative w-full rounded-2xl animate-border-spin ${focused ? "h-32 shadow-[0_0_30px_rgba(207,195,255,0.25),0_0_60px_rgba(254,208,131,0.2)]" : "h-20"}`}
        >
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="What do you want to learn?"
            className="absolute inset-[0.5px] pl-12 pr-20 py-0 bg-transparent rounded-2xl border border-transparent focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-base text-on-surface placeholder:text-outline-variant z-10"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-4 bg-gradient-to-br from-deep-onyx to-[#2a2411] text-white rounded-full font-label text-xs tracking-[0.1em] uppercase hover:opacity-90 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm btn-glow z-20 disabled:opacity-30 disabled:cursor-not-allowed"
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
