import { NextRequest, NextResponse } from "next/server"
import { classifyByKeywords, classifyPrompt, BROAD_CATEGORIES } from "@/lib/categories"
import type { BroadCategory } from "@/lib/categories"

const NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const MODEL = "mistralai/mistral-small-4-119b-2603"

const cache = new Map<string, BroadCategory>()

async function classifyViaNIM(title: string, apiKey: string): Promise<BroadCategory | null> {
  try {
    const response = await fetch(NIM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You classify topics into broad categories. Return ONLY the category name, no other text." },
          { role: "user", content: classifyPrompt(title) },
        ],
        temperature: 0.1,
        max_tokens: 32,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null

    const data = await response.json()
    const content: string = data.choices?.[0]?.message?.content?.trim()

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

    const apiKey = process.env.NVIDIA_NIM_API_KEY

    let category: BroadCategory | null = null

    if (apiKey) {
      category = await classifyViaNIM(title, apiKey)
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
