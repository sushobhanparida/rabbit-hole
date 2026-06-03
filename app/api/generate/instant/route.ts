import { NextRequest, NextResponse } from "next/server";
import { buildTemplateFlow } from "@/lib/template-generator";
import { searchTopic } from "@/lib/tavily";

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

async function fetchCategory(title: string, topicId: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, topicId }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.category || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicId, title, description } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const [wikipediaExtract, tavilyResponse, category] = await Promise.all([
      fetchWikipedia(title),
      searchTopic(title),
      fetchCategory(title, topicId || title),
    ]);

    const searchResults = tavilyResponse?.results || [];
    const flow = buildTemplateFlow(topicId, title, description || `Learn about ${title}`, wikipediaExtract, searchResults);
    flow.category = category || undefined;

    return NextResponse.json({ success: true, data: flow });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate content" }, { status: 500 });
  }
}
