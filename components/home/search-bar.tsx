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
    <div className="mb-10">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a3a3a3] pointer-events-none">
            <Sparkles className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type any topic to explore..."
            className="w-full h-14 pl-14 pr-14 bg-[#f8f8f8] border border-[#e4e4e4] rounded-[24px] text-base text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#1a1a1a] focus:bg-white transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 bg-[#1a1a1a] text-white rounded-[20px] text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            Go
          </button>
        </div>
      </form>
      <div className="flex gap-2 mt-3 px-1 flex-wrap">
        {examples.map((ex) => (
          <button
            key={ex.query}
            onClick={() => handleExample(ex.label, ex.query)}
            className="text-sm text-[#a3a3a3] hover:text-[#1a1a1a] transition-colors duration-200 px-3 py-1 rounded-full hover:bg-[#f5f5f5]"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}
