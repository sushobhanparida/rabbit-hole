type SyncOptions = { onError?: (err: unknown) => void }

async function fetchOrFallback(input: RequestInfo | URL, init?: RequestInit, options?: SyncOptions) {
  try {
    const res = await fetch(input, init)
    if (!res.ok) throw new Error(`Sync request failed: ${res.status}`)
    return await res.json()
  } catch (err) {
    options?.onError?.(err)
    return null
  }
}

export function syncUser(userId: string, data: { email: string; name: string; xp?: number }) {
  return fetchOrFallback("/api/sync/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, id: userId }),
  })
}

export function syncProgress(userId: string, progress: {
  topicId: string
  topicTitle?: string
  completed?: boolean
  cardsViewed?: number
  totalCards?: number
  quizScore?: number
  quizTotal?: number
  xpEarned?: number
  xpBreakdown?: Record<string, number>
  quizXpValues?: number[]
}) {
  return fetchOrFallback("/api/sync/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...progress }),
  })
}

export function syncRecentTopic(userId: string, topicId: string, topicTitle?: string) {
  return fetchOrFallback("/api/sync/recent-topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, topicId, topicTitle }),
  })
}

export function syncFlow(flow: {
  topicId: string
  topicTitle?: string
  cards: unknown[]
  quiz: unknown
  connectedTopics: unknown[]
  source?: string
}) {
  return fetchOrFallback("/api/sync/flow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flow),
  })
}

export async function loadFlow(topicId: string) {
  const result = await fetchOrFallback(`/api/sync/flow?topicId=${encodeURIComponent(topicId)}`)
  return result?.flow ?? null
}

export function syncUserXp(userId: string, xp: number) {
  return fetchOrFallback("/api/sync/user/xp", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, xp }),
  })
}

export function syncProfileTopics(userId: string, topics_completed: number) {
  return fetchOrFallback("/api/sync/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, topics_completed }),
  })
}
