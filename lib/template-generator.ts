import type { CardContent, ConnectedTopic } from "./types"
import type { TavilyResult } from "./tavily"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extractTopics(text: string, title: string): ConnectedTopic[] {
  const words = text.replace(/[^\w\s]/g, "").split(/\s+/)
  const freq = new Map<string, number>()
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "need", "dare", "ought", "used", "this", "that", "these", "those", "it", "its", "they", "them", "their", "we", "us", "our", "you", "your", "he", "she", "him", "her", "his"])
  for (const w of words) {
    const lower = w.toLowerCase()
    if (lower.length > 4 && !stopWords.has(lower) && lower !== title.toLowerCase()) {
      freq.set(lower, (freq.get(lower) || 0) + 1)
    }
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
  return sorted.slice(0, 4).map(([word]) => ({
    id: slugify(word),
    title: word.charAt(0).toUpperCase() + word.slice(1),
    description: `Explore more about ${word} and its connection to ${title}.`,
    relationship: "Related" as const,
  }))
}

function pickImage(results: TavilyResult[], index: number, usedUrls?: Set<string>): { url?: string; source?: string } {
  for (const r of results.slice(index)) {
    if (r.images) {
      for (const img of r.images) {
        if (!usedUrls?.has(img)) {
          usedUrls?.add(img)
          return { url: img, source: r.url }
        }
      }
    }
  }
  for (const r of results) {
    if (r.images) {
      for (const img of r.images) {
        if (!usedUrls?.has(img)) {
          usedUrls?.add(img)
          return { url: img, source: r.url }
        }
      }
    }
  }
  return {}
}

function matchImagesToCards(cards: CardContent[], results: TavilyResult[]): CardContent[] {
  const usedImages = new Set<string>()
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were"])

  return cards.map((card, idx) => {
    if (idx !== 0) return { ...card, image: undefined, imageAlt: undefined, imageSource: undefined }

    const keywords = card.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))

    const scored = results.map((r) => {
      const haystack = (r.title + " " + (r.content || "")).toLowerCase()
      const score = keywords.filter((k) => haystack.includes(k)).length
      return { result: r, score }
    })

    scored.sort((a, b) => b.score - a.score)

    for (const { result } of scored) {
      if (result.images && result.images.length > 0) {
        for (const img of result.images) {
          if (!usedImages.has(img)) {
            usedImages.add(img)
            return { ...card, image: img, imageAlt: result.title, imageSource: result.url }
          }
        }
      }
    }

    return card
  })
}

function sourceLinks(results: TavilyResult[]): { title: string; url: string; favicon?: string }[] {
  return results.slice(0, 3).map((r) => ({ title: r.title, url: r.url, favicon: r.favicon }))
}

export { extractTopics, pickImage, matchImagesToCards, sourceLinks, slugify }
