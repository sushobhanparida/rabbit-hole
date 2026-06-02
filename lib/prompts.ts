import type { TavilyResult } from "./tavily"

export function buildCardsPrompt(): string {
  return `You generate educational content cards as JSON. Return ONLY valid JSON.

Format:
{"cards":[{"id":"c1","type":"hook|fact|timeline|diagram|comparison|prediction|poll|question","title":"Title","body":"Markdown body with **bold** and *italic*. Separate paragraphs with blank lines. End with **Sources** line.","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why correct","events":[{"date":"1969","label":"First flight","description":"Details"}],"comparisonA":"Item A","comparisonB":"Item B","labelA":"Then","labelB":"Now","diagramLabels":["Label 1"],"fact":"Optional callout"}],"connectedTopics":[{"id":"slug","title":"Title","description":"Brief","relationship":"Related|Deeper Dive"}]}

RULES:
4-8 cards, first is "hook". Each body 100+ words. Omit image field if unsure.
Use **bold** for key terms. Reference specific data from the research.`
}

export function buildQuizPrompt(cardsContext: string): string {
  return `Generate 3 quiz questions based on this educational content. Return ONLY valid JSON.

Format:
{"questions":[{"id":"q1","question":"Question text","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why correct (markdown allowed)"}]}

Content to base questions on:
${cardsContext}

RULES:
- 3 questions with well-crafted distractors
- Each explanation must say why correct and why each wrong answer is wrong
- Return ONLY valid JSON — no other text, no markdown fences`
}

export function buildResearchContext(
  title: string,
  wikipediaExtract: string | null,
  searchResults: TavilyResult[]
): string {
  let context = `Research: ${title}\n`

  if (wikipediaExtract) {
    context += `${wikipediaExtract.slice(0, 400)}\n`
  }

  if (searchResults.length > 0) {
    for (const r of searchResults.slice(0, 2)) {
      context += `- ${r.title}: ${r.content.slice(0, 200)}\n`
    }
  }

  return context
}

export function buildUserPrompt(title: string, description: string, context?: string): string {
  if (context) {
    return `Generate learning cards about: "${title}"

${description}

Research:
${context}

4-8 rich cards (100+ words each). End each body with **Sources**. Return ONLY valid JSON.`
  }

  return `Generate learning cards about: "${title}"

${description}

4-8 rich cards. Return ONLY valid JSON.`
}
