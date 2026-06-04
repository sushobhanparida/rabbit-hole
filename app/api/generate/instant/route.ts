import { NextRequest, NextResponse } from "next/server";
import { searchTopic } from "@/lib/tavily";
import { matchImagesToCards, sourceLinks, extractTopics, pickImage } from "@/lib/template-generator";
import { buildCardsPrompt, buildUserPrompt, buildResearchContext } from "@/lib/prompts";
import type { CardContent, QuizQuestion, ConnectedTopic, LearningFlow } from "@/lib/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function normalizeCards(cards: any[]): CardContent[] {
  for (const card of cards) {
    if (card.title && typeof card.title !== "string") card.title = String(card.title?.label || card.title?.title || card.title);
    if (card.body && typeof card.body !== "string") card.body = String(card.body?.label || card.body?.body || card.body);
    if (card.body) card.body = card.body.replace(/\n/g, "\n\n").replace(/\n\n\n+/g, "\n\n");
  }
  return cards;
}

function normalizeQuizQuestions(questions: any[]): QuizQuestion[] {
  for (const q of questions) {
    if (q.options && Array.isArray(q.options)) {
      q.options = q.options.map((o: any) => typeof o === "string" ? o : o?.label || o?.title || String(o));
    }
    if (q.explanation && typeof q.explanation !== "string") q.explanation = String(q.explanation?.label || q.explanation?.explanation || q.explanation);
    if (q.question && typeof q.question !== "string") q.question = String(q.question?.label || q.question?.question || q.question);
  }
  return questions;
}

function parseJSON(content: string): any {
  const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  console.error("[parseJSON] raw length:", content.length, "stripped length:", jsonStr.length, "preview:", jsonStr.slice(0, 500));
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  // Debug: check first few characters
  const firstChars = jsonMatch[0].slice(0, 20).split("").map((c) => `${c} (${c.charCodeAt(0)})`).join(", ");
  console.error("[parseJSON] first 20 chars:", firstChars);

  const tryParse = (s: string) => {
    try { return JSON.parse(s) } catch (e) {
      if (s.length < 10000) console.error("[parseJSON] parse error:", (e as Error).message, "around:", s.slice(Math.max(0, ((e as SyntaxError).message?.match(/position\s+(\d+)/)?.[1] ? Number((e as SyntaxError).message.match(/position\s+(\d+)/)![1]) - 50 : 0)), ((e as SyntaxError).message?.match(/position\s+(\d+)/)?.[1] ? Number((e as SyntaxError).message.match(/position\s+(\d+)/)![1]) + 50 : 200)));
      return null
    }
  };

  let parsed = tryParse(jsonMatch[0]);
  if (parsed) return parsed;

  const fixed = jsonMatch[0]
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
    .replace(/(\W)'/g, '$1"')
    .replace(/'(\W)/g, '"$1')
    .replace(/,\s*"([^"]+)":\s*,/g, ',"$1":null,')
    .replace(/,\s*"([^"]+)":\s*([}\]])/g, ',"$1":null$2')
    .replace(/:\s*,\s*/g, ":null,")
    .trim();

  parsed = tryParse(fixed);
  if (parsed) return parsed;

  // Try balanced fix (handles missing closing braces/rackets)
  const balanced = balanceJson(jsonMatch[0]);
  if (balanced !== jsonMatch[0]) {
    parsed = tryParse(balanced);
    if (parsed) return parsed;
  }

  // Last resort: try to extract the last complete object
  const depth = (s: string) => {
    let d = 0, i = 0;
    for (; i < s.length && d >= 0; i++) {
      if (s[i] === "{") d++;
      else if (s[i] === "}") d--;
    }
    return i;
  };
  const end = jsonMatch[0].lastIndexOf("}");
  const truncated = jsonMatch[0].slice(0, end + 1) + "}".repeat(depth(jsonMatch[0].slice(0, end + 1)));
  parsed = tryParse(truncated);
  if (parsed) return parsed;

  // Last resort: try finding content between { and its matching }
  const firstBrace = jsonMatch[0].indexOf("{");
  const closeIdx = depth(jsonMatch[0].slice(firstBrace + 1));
  if (closeIdx > 0) {
    parsed = tryParse(jsonMatch[0].slice(firstBrace, firstBrace + closeIdx + 1));
    if (parsed) return parsed;
  }

  throw new SyntaxError("Failed to parse JSON from model response");
}

function balanceJson(s: string): string {
  const stack: string[] = [];
  let inString = false, escaped = false;
  for (const ch of s) {
    if (escaped) { escaped = false; continue }
    if (ch === "\\" && inString) { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === "{" || ch === "[") stack.push(ch)
    else if (ch === "}" && stack.length && stack[stack.length-1] === "{") stack.pop()
    else if (ch === "]" && stack.length && stack[stack.length-1] === "[") stack.pop()
  }
  let close = ""
  for (let i = stack.length - 1; i >= 0; i--) close += stack[i] === "{" ? "}" : "]"
  return s + close
}

async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string) {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 6144,
      },
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Empty response from model");
  }

  return parseJSON(content);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicId, title, description } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    // Search Tavily for web results + images
    const tavilyResponse = await searchTopic(title);
    const searchResults = tavilyResponse?.results || [];
    const researchContext = buildResearchContext(title, searchResults);
    const hasResearch = researchContext.trim().split("\n").length > 2;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Gemini path — generate cards + quiz + connected topics in one call
      const userPrompt = hasResearch
        ? buildUserPrompt(title, description || `Learn about ${title}`, researchContext)
        : buildUserPrompt(title, description || `Learn about ${title}`);

      const generated = await callGemini(buildCardsPrompt(), userPrompt, apiKey);

      // Parse cards
      let cards: CardContent[] = generated.cards || [];
      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error("No cards generated");
      }
      cards = normalizeCards(cards);

      // Attach Tavily images to cards by content relevance
      cards = matchImagesToCards(cards, searchResults);

      // Attach source links from Tavily
      const links = sourceLinks(searchResults);
      cards = cards.map((c) => ({
        ...c,
        sources: c.sources?.length ? c.sources : links,
      }));

      // Parse quiz
      const quizData = generated.quiz || generated.quiz?.questions || { questions: [] };
      const questions = Array.isArray(quizData) ? quizData : (quizData.questions || []);
      const quiz = { questions: normalizeQuizQuestions(questions.slice(0, 3)) };

      // Parse connected topics
      let connectedTopics: ConnectedTopic[] = (generated.connectedTopics || []).slice(0, 6);
      if (connectedTopics.length === 0) {
        const text = cards.map((c) => c.body).join(" ");
        connectedTopics = extractTopics(text, title);
      }

      const flow: LearningFlow = {
        topicId,
        cards,
        quiz,
        connectedTopics,
      };

      return NextResponse.json({ success: true, data: flow });
    }

    // Fallback: keyword-based extraction (no NVIDIA)
    const text = searchResults.map((r) => r.content).join(" ") || description || title;
    const sentences = text.match(/[^.!?\n]+[.!?]+/g) || [text.slice(0, 200)];
    const usedImages = new Set<string>();

    const cards: CardContent[] = [];
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const img = pickImage(searchResults, i, usedImages);
      cards.push({
        id: `c${i + 1}`,
        title: i === 0 ? `Understanding ${title}` : (sentences[i].split(" ").slice(0, 6).join(" ") || `Key Point ${i + 1}`),
        body: sentences[i]?.trim() || "No content available.",
        image: img.url,
        imageAlt: searchResults[i % searchResults.length]?.title,
        imageSource: img.source,
        sources: sourceLinks(searchResults),
      });
    }

    const connectedTopics = extractTopics(text, title);

    const flow: LearningFlow = {
      topicId,
      cards,
      quiz: {
        questions: [
          {
            id: "q1",
            question: `What is ${title} primarily about?`,
            options: ["The core concepts and context", "An unrelated topic", "A recent discovery", "A fictional idea"],
            correctIndex: 0,
            explanation: `${title} covers specific concepts and context that define its study.`,
          },
          {
            id: "q2",
            question: `Why is ${title} significant?`,
            options: ["It has notable real-world impact", "It is purely theoretical", "It only matters historically", "It is not well understood"],
            correctIndex: 0,
            explanation: `The significance of ${title} comes from its real-world implications and insights.`,
          },
          {
            id: "q3",
            question: `Which best describes our understanding of ${title}?`,
            options: ["It has been studied and documented by experts", "It remains completely unknown", "It was disproven", "It applies only to one case"],
            correctIndex: 0,
            explanation: `Research and documentation about ${title} provide a foundation for understanding its key aspects.`,
          },
        ],
      },
      connectedTopics,
    };

    return NextResponse.json({ success: true, data: flow });
  } catch (error) {
    console.error("[generate/instant]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
