export function buildCardsPrompt(): string {
  return `You generate educational overviews as cards, similar to Google's AI Mode — comprehensive, well-structured, and source-backed. Return ONLY valid JSON.

Format:
{"cards":[{"id":"c1","title":"Compelling Title","body":"~150 words max of rich markdown body with key terms. Use double newlines (\\n\\n) between each paragraph."}],"quiz":{"questions":[{"id":"q1","question":"Question text","options":["A","B","C","D"],"correctIndex":2,"explanation":"Why correct (markdown allowed)"}]},"connectedTopics":[{"id":"slug","title":"Topic Name","description":"Brief why this connects","relationship":"Subtopic|Prerequisite|Related|Deeper Dive"}]}

RULES:
- 5 cards, each with a distinct angle on the topic (e.g. history, mechanics, impact, controversies, future)
- Each body 150 words max — keep it tight but substantive
- **IMPORTANT: Use \\n\\n between paragraphs.** Every paragraph must be separated by a blank line.
- Quiz: randomize correctIndex across 0-3, never always pick the first option

- Cards should feel like Google AI Mode overviews — comprehensive standalone sections
- Generate 3 quiz questions that test genuine understanding
- Return ONLY valid JSON — no other text, no markdown fences`
}

export function buildUserPrompt(
  title: string,
  description: string,
  context?: string
): string {
  if (context) {
    return `Topic: "${title}"

${description}

Research:
${context}

Generate exactly 5 rich cards (150 words max each) covering distinct angles of this topic. Also generate 3 quiz questions and 4+ connected topics. Return ONLY valid JSON.`
  }

  return `Topic: "${title}"

${description}

Generate exactly 5 rich cards (150 words max each) covering distinct angles of this topic. Also generate 3 quiz questions and 4+ connected topics. Return ONLY valid JSON.`
}

export function buildResearchContext(
  title: string,
  searchResults: { title: string; content: string; url: string; score: number }[]
): string {
  let context = `Research: ${title}\n`

  if (searchResults.length > 0) {
    for (const r of searchResults.slice(0, 3)) {
      context += `- ${r.title}: ${r.content.slice(0, 300)}\n`
    }
  }

  return context
}
