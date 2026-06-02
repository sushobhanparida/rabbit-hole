export interface TavilyResult {
  title: string
  content: string
  url: string
  score: number
  images?: string[]
  published_date?: string
  favicon?: string
}

interface TavilyResponse {
  results: TavilyResult[]
  answer?: string
  images?: string[]
}

export async function searchTopic(query: string): Promise<TavilyResponse | null> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        include_answer: true,
        include_images: true,
        max_results: 5,
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
