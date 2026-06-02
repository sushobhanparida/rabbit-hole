import type { LearningFlow, QuizQuestion, CardContent, ConnectedTopic } from "./types";

export interface GenerateResult {
  data?: LearningFlow;
  error?: string;
}

export interface CardsResult {
  data?: { cards: CardContent[]; connectedTopics: ConnectedTopic[] };
  error?: string;
}

export interface QuizResult {
  data?: { questions: QuizQuestion[] };
  error?: string;
}

export async function generateInstantFlow(
  topicId: string,
  title: string,
  description: string
): Promise<GenerateResult> {
  try {
    const response = await fetch("/api/generate/instant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, title, description }),
    });

    const result = await response.json();
    if (!result.success) {
      return { error: result.error || "Failed to generate content" };
    }
    return { data: result.data as LearningFlow };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Network error.",
    };
  }
}

export async function generateCards(
  topicId: string,
  title: string,
  description: string
): Promise<CardsResult> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, title, description, mode: "cards" }),
    });

    const result = await response.json();
    if (!result.success) {
      return { error: result.error || "Failed to generate content" };
    }
    return { data: result.data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error." };
  }
}

export async function generateQuiz(
  title: string,
  cardsContext: string
): Promise<QuizResult> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, mode: "quiz", cardsContext }),
    });

    const result = await response.json();
    if (!result.success) {
      return { error: result.error || "Failed to generate quiz" };
    }
    return { data: result.data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error." };
  }
}
