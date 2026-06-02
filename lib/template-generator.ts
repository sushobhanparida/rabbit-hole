import type { CardContent, LearningFlow, QuizQuestion, ConnectedTopic } from "./types"
import type { TavilyResult } from "./tavily"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function extractSentences(text: string, count: number): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?]+/g) || text.split(/\n{2,}/).filter(Boolean) || [text]
  return sentences.slice(0, count).map((s) => s.trim()).filter((s) => s.length > 20)
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
    relationship: "Related",
  }))
}

function generateQuizFromText(text: string, title: string): QuizQuestion[] {
  const sentences = extractSentences(text, 8)

  const q1 = buildQuizQuestion(sentences, title, 0, "q1")
  const q2 = buildQuizQuestion(sentences, title, 1, "q2")
  const q3 = buildQuizQuestion(sentences, title, 2, "q3")

  return [q1, q2, q3]
}

function buildQuizQuestion(sentences: string[], title: string, index: number, id: string): QuizQuestion {
  const fallbacks = [
    {
      question: `What is ${title} primarily about?`,
      options: [
        `A specific concept or phenomenon in its field`,
        `An unrelated historical event`,
        `A modern technological innovation`,
        `A philosophical idea`,
      ],
      correctIndex: 0,
      explanation: `${title} is a topic with specific characteristics and context that define its study.`,
    },
    {
      question: `Why is ${title} considered significant?`,
      options: [
        `It has notable implications and applications`,
        `It was popularized by social media`,
        `It only matters in theoretical contexts`,
        `It is a recently discovered phenomenon`,
      ],
      correctIndex: 0,
      explanation: `The significance of ${title} comes from its real-world impact and the insights it provides.`,
    },
    {
      question: `Which statement best reflects what we know about ${title}?`,
      options: [
        `It has been studied and documented by experts`,
        `It remains completely unknown to researchers`,
        `It was proven false decades ago`,
        `It applies only to a single specific case`,
      ],
      correctIndex: 0,
      explanation: `Research and documentation about ${title} provide a foundation for understanding its key aspects.`,
    },
  ]

  if (index === 0 && sentences.length > 0) {
    const withNumbers = sentences.filter((s) => /\d+/.test(s))
    if (withNumbers.length > 0) {
      const s = withNumbers[0]
      const words = s.split(" ")
      const numIndex = words.findIndex((w) => /\d+/.test(w))
      if (numIndex >= 0) {
        const answer = words[numIndex]
        const num = parseInt(answer.replace(/[^\d-]/g, ""), 10)
        if (!isNaN(num)) {
          const blank = s.replace(answer, "_______")
          const distractors = [
            String(num + Math.floor(Math.random() * 10) + 5),
            String(num * 2 + Math.floor(Math.random() * 5)),
            String(Math.max(1, num - Math.floor(Math.random() * 5) - 2)),
          ].filter((d) => d !== answer)
          const allOptions = [answer, ...distractors].sort(() => Math.random() - 0.5)
          const correctIndex = allOptions.indexOf(answer)
          return {
            id,
            question: `Fill in the blank: ${blank.trim()}`,
            options: allOptions,
            correctIndex,
            explanation: `The correct answer is ${answer}. This comes from the source material about ${title}.`,
          }
        }
      }
    }
  }

  if (index < sentences.length) {
    const s = sentences[index]
    const labels = [
      `Which of the following best describes ${title}?`,
      `What is a key aspect of ${title}?`,
      `Which statement is true about ${title}?`,
    ]
    const wrongs = [
      [`An unrelated concept from a different field`, `A modern invention from the 21st century`, `A theory that was later disproven`],
      [`It was discovered by accident`, `It only applies to theoretical scenarios`, `It contradicts earlier established knowledge`],
      [`It was developed primarily for entertainment`, `It has no practical applications`, `It is widely considered outdated`],
    ]
    const correctText = s.trim().length > 100 ? s.trim().slice(0, s.lastIndexOf(" ", 100)) + "..." : s.trim()
    const allOptions = [correctText, ...(wrongs[index] || wrongs[0])].sort(() => Math.random() - 0.5)
    return {
      id,
      question: labels[index] || `What do we know about ${title}?`,
      options: allOptions,
      correctIndex: allOptions.indexOf(correctText),
      explanation: s.trim().length > 120 ? s.trim().slice(0, s.lastIndexOf(" ", 120)) + "..." : s.trim(),
    }
  }

  return { id, ...fallbacks[index] }
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

function sourceLinks(results: TavilyResult[]): { title: string; url: string; favicon?: string }[] {
  return results.slice(0, 3).map((r) => ({ title: r.title, url: r.url, favicon: r.favicon }))
}

export function buildTemplateFlow(
  topicId: string,
  title: string,
  description: string,
  wikipediaExtract: string | null,
  searchResults: TavilyResult[]
): LearningFlow {
  const sorted = [...searchResults].sort((a, b) => b.score - a.score)
  const text = wikipediaExtract || sorted.map((r) => r.content).join(" ") || description
  const sentences = extractSentences(text, 12)

  const topResult = sorted[0]

  const cards: CardContent[] = []
  const usedImages = new Set<string>()

  // Card 1: intro (always)
  const img0 = pickImage(sorted, 0, usedImages)
  cards.push({
    id: "intro-1",
    type: "fact",
    title: `Understanding ${title}`,
    body: `${sentences[0] || description}\n\nIn this learning flow, we will explore the key concepts, historical context, and practical implications of ${title}. By the end, you'll have a solid foundational understanding of what makes this topic so important.`,
    image: img0.url,
    imageSource: img0.source,
    imageAlt: topResult?.title,
    sources: sourceLinks(sorted),
  })

  // Content cards from available sentences
  const contentSentences = sentences.slice(1)
  const maxContentCards = Math.min(contentSentences.length, 6)
  for (let i = 0; i < maxContentCards; i++) {
    const s = contentSentences[i]
    const nextS = contentSentences[i + 1]
    const result = sorted[i % sorted.length]
    const isNews = result?.published_date
    const titleWords = s.split(" ").slice(0, 5).join(" ")
    const title = titleWords.length > 12 ? titleWords : result?.title || `Key Concept ${i + 1}`

    const img = pickImage(sorted, i + 1, usedImages)

    cards.push({
      id: `content-${i + 1}`,
      type: "fact",
      title,
      body: `${s}${nextS ? `\n\n${nextS}` : ""}${isNews ? `\n\n*Source: ${result?.published_date}*` : ""}`,
      image: img.url,
      imageSource: img.source,
      imageAlt: result?.title,
      sources: sourceLinks(sorted),
    })
  }

  const quiz = { questions: generateQuizFromText(text, title) }
  const connectedTopics = extractTopics(text, title)

  return {
    cards,
    quiz,
    connectedTopics,
    topicId,
  }
}
