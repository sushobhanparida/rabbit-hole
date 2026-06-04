import type { LearningFlow } from "./types";

export interface GenerateResult {
  data?: LearningFlow;
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
