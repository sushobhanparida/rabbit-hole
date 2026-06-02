import { NextRequest, NextResponse } from "next/server";
import {
  buildCardsPrompt,
  buildQuizPrompt,
  buildUserPrompt,
  buildResearchContext,
} from "@/lib/prompts";
import { searchTopic } from "@/lib/tavily";
import type { QuizQuestion, ConnectedTopic, CardContent } from "@/lib/types";

const NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "microsoft/phi-4-mini-instruct";

interface GenerateRequest {
  topicId?: string;
  title: string;
  description?: string;
  mode?: "cards" | "quiz";
  cardsContext?: string;
}

async function fetchWikipedia(title: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.extract || null;
  } catch {
    return null;
  }
}

function normalizeCards(cards: any[]): CardContent[] {
  for (const card of cards) {
    if (card.title && typeof card.title !== "string") card.title = String(card.title?.label || card.title?.title || card.title);
    if (card.body && typeof card.body !== "string") card.body = String(card.body?.label || card.body?.body || card.body);
    if (card.fact && typeof card.fact !== "string") card.fact = String(card.fact?.label || card.fact?.fact || card.fact);
    if (card.explanation && typeof card.explanation !== "string") card.explanation = String(card.explanation?.label || card.explanation?.explanation || card.explanation);
    if (card.options && Array.isArray(card.options)) {
      card.options = card.options.map((o: any) => typeof o === "string" ? o : o?.label || o?.title || String(o));
    }
    if (card.diagramLabels && Array.isArray(card.diagramLabels)) {
      card.diagramLabels = card.diagramLabels.map((l: any) => typeof l === "string" ? l : l?.label || l?.title || String(l));
    }
    if (card.events && Array.isArray(card.events)) {
      card.events = card.events.map((e: any) => ({
        date: typeof e.date === "string" ? e.date : String(e.date),
        label: typeof e.label === "string" ? e.label : "",
        description: e.description ? (typeof e.description === "string" ? e.description : String(e.description)) : undefined,
      }));
    }
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
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    const fixed = jsonMatch[0]
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
      .replace(/'/g, '"');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("Raw response:", jsonMatch[0].slice(0, 2000));
      throw e2;
    }
  }
}

async function callNIM(systemPrompt: string, userPrompt: string, apiKey: string) {
  const response = await fetch(NIM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 3072,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NIM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from model");
  }

  return parseJSON(content);
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { title, mode = "cards", cardsContext } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Topic title is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_NIM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "NVIDIA NIM API key is not configured" },
        { status: 500 }
      );
    }

    // Quiz mode: generate quiz questions from cards context
    if (mode === "quiz") {
      if (!cardsContext) {
        return NextResponse.json(
          { success: false, error: "cardsContext is required for quiz mode" },
          { status: 400 }
        );
      }

      const quizData = await callNIM(buildQuizPrompt(cardsContext), `Generate quiz questions based on these cards:\n\n${cardsContext}`, apiKey);

      const questions = quizData.questions || quizData.quiz?.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json(
          { success: false, error: "No quiz questions generated" },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { questions: normalizeQuizQuestions(questions) },
      });
    }

    // Cards mode: generate cards + connected topics
    const description = body.description || `Learn about ${title}`;

    const [wikipediaExtract, tavilyResponse] = await Promise.all([
      fetchWikipedia(title),
      searchTopic(title),
    ]);

    const searchResults = tavilyResponse?.results || [];
    const researchContext = buildResearchContext(title, wikipediaExtract, searchResults);
    const hasResearch = researchContext.trim().split("\n").length > 2;
    const userPrompt = hasResearch
      ? buildUserPrompt(title, description, researchContext)
      : buildUserPrompt(title, description);

    const generated = await callNIM(buildCardsPrompt(), userPrompt, apiKey);

    const cards = generated.cards;
    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json(
        { success: false, error: "Generated content is missing cards array" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cards: normalizeCards(cards),
        connectedTopics: (generated.connectedTopics || []) as ConnectedTopic[],
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
