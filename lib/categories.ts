export const BROAD_CATEGORIES = [
  "TECHNOLOGY",
  "SCIENCE",
  "HISTORY",
  "ARTS & CULTURE",
  "NATURE & ENVIRONMENT",
  "SPACE & ASTRONOMY",
  "ENGINEERING",
  "MEDICINE & HEALTH",
  "ECONOMICS & FINANCE",
  "PHILOSOPHY & RELIGION",
  "SPORTS & RECREATION",
  "POLITICS & GOVERNMENT",
  "BUSINESS & ENTREPRENEURSHIP",
  "PSYCHOLOGY & NEUROSCIENCE",
  "MATHEMATICS",
  "MUSIC & ENTERTAINMENT",
  "FOOD & NUTRITION",
  "GEOGRAPHY & TRAVEL",
  "MILITARY & DEFENSE",
  "EDUCATION",
] as const

export type BroadCategory = typeof BROAD_CATEGORIES[number]

const categoryKeywords: [RegExp, BroadCategory][] = [
  [/quantum|physics|particle|atom|molecule|nuclear|chemical|biology|biology|dna|gene|evolution|species|organism|cell/i, "SCIENCE"],
  [/tech|software|code|digital|algorithm|data|ai|machine|computer|robot|cyber|internet|app|phone|gpu|cpu|chip|rtx|gps|blockchain/i, "TECHNOLOGY"],
  [/space|star|galaxy|planet|moon|mars|solar|cosmos|astronomy|universe|black\s?hole|nebula|orbit/i, "SPACE & ASTRONOMY"],
  [/engineer|concorde|rocket|bridge|structure|machine|vehicle|flight|mechanical|electrical|civil|construction/i, "ENGINEERING"],
  [/health|disease|virus|bacteria|medicine|drug|vaccine|surgery|diagnosis|treatment|symptom|therapy/i, "MEDICINE & HEALTH"],
  [/economy|money|market|trade|business|finance|capital|stock|bank|investment|inflation|gdp/i, "ECONOMICS & FINANCE"],
  [/brain|neuron|neural|mind|psychology|behavior|cognition|memory|mental|therapy|emotion/i, "PSYCHOLOGY & NEUROSCIENCE"],
  [/ancient|history|roman|empire|war|revolution|medieval|world.?war|civilization|colonial|kingdom/i, "HISTORY"],
  [/art|music|film|design|culture|language|book|story|poem|theater|drama|painting|sculpture/i, "ARTS & CULTURE"],
  [/nature|animal|plant|ocean|sea|marine|trench|forest|rainforest|coral|ecosystem|wildlife/i, "NATURE & ENVIRONMENT"],
  [/climate|weather|earth|environment|energy|solar|wind|green|renewable|pollution|conservation/i, "NATURE & ENVIRONMENT"],
  [/math|equation|calculus|algebra|geometry|statistics|probability|theorem|proof|number/i, "MATHEMATICS"],
  [/philosophy|ethics|moral|religion|god|faith|belief|existential|consciousness|logic/i, "PHILOSOPHY & RELIGION"],
  [/sport|game|chess|olympic|athlete|soccer|football|basketball|tennis|cricket|baseball/i, "SPORTS & RECREATION"],
  [/politics|government|democracy|election|policy|law|rights|constitution|senate|congress|party/i, "POLITICS & GOVERNMENT"],
  [/startup|entrepreneur|venture|founder|innovation|company|corporate|management|leadership/i, "BUSINESS & ENTREPRENEURSHIP"],
  [/food|cooking|recipe|nutrition|diet|cuisine|ingredient|flavor|chef|restaurant|wine/i, "FOOD & NUTRITION"],
  [/music|song|album|band|concert|instrument|melody|rhythm|entertainment|movie|film|celebrity/i, "MUSIC & ENTERTAINMENT"],
  [/travel|tourism|city|country|continent|geography|map|exploration|destination|landmark/i, "GEOGRAPHY & TRAVEL"],
  [/military|army|navy|air\s?force|defense|weapon|missile|tank|soldier|battle|war|combat/i, "MILITARY & DEFENSE"],
  [/education|school|university|college|learning|teaching|curriculum|student|teacher|classroom/i, "EDUCATION"],
]

export function classifyByKeywords(title: string, topicId?: string): BroadCategory | null {
  const searchText = `${title} ${topicId || ""}`
  for (const [pattern, category] of categoryKeywords) {
    if (pattern.test(searchText)) return category
  }
  return null
}

export function classifyPrompt(title: string): string {
  return `Classify the topic "${title}" into exactly one of these broad categories. Pick the closest match even if not perfect:

${BROAD_CATEGORIES.map((c) => `- ${c}`).join("\n")}

Return ONLY the category name, nothing else. No punctuation, no explanation, no markdown.`
}
