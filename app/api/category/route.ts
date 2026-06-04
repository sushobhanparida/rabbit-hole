import { NextRequest, NextResponse } from "next/server"
import { classifyByKeywords, classifyPrompt, BROAD_CATEGORIES } from "@/lib/categories"
import type { BroadCategory } from "@/lib/categories"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent"

const cache = new Map<string, BroadCategory>()

async function classifyViaGemini(title: string, apiKey: string): Promise<BroadCategory | null> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `You classify topics into broad categories. Return ONLY the category name, no other text.\n\n${classifyPrompt(title)}` }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 32,
        },
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null

    const data = await response.json()
    const content: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!content) return null

    const cleaned = content.replace(/[^a-zA-Z &-]/g, "").trim()
    if (BROAD_CATEGORIES.includes(cleaned as any)) {
      return cleaned as BroadCategory
    }

    for (const cat of BROAD_CATEGORIES) {
      if (cat.toLowerCase().startsWith(cleaned.toLowerCase().slice(0, 4))) return cat
    }

    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, topicId } = await request.json()

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    const cacheKey = topicId || title.toLowerCase()
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, category: cached })
    }

    const apiKey = process.env.GEMINI_API_KEY

    let category: BroadCategory | null = null

    if (apiKey) {
      category = await classifyViaGemini(title, apiKey)
    }

    if (!category) {
      category = classifyByKeywords(title, topicId)
    }

    if (!category) {
      category = "SCIENCE"
    }

    cache.set(cacheKey, category)

    return NextResponse.json({ success: true, category })
  } catch (err) {
    console.error("[/api/category] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
