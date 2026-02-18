import { getAIClient } from "./client";

export type SummarizeResult = {
  summary: string;
  aiTake: string;
};

export async function summarizeArticle(title: string, content: string): Promise<SummarizeResult> {
  const client = getAIClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are summarizing a web article for a daily article digest site.

Article title: ${title}

Article content:
${content.slice(0, 10000)}

Respond with EXACTLY this JSON format, nothing else:
{
  "summary": "A clear, concise 2-3 sentence summary of the article's key points.",
  "aiTake": "A brief, opinionated 1-2 sentence take on why this article matters or what's interesting about it."
}`,
      },
    ],
  });

  const firstBlock = response.content[0];
  const text = firstBlock?.type === "text" ? firstBlock.text : "";
  const parsed = JSON.parse(text);

  if (!parsed.summary || !parsed.aiTake) {
    throw new Error("AI response missing required fields");
  }

  return { summary: parsed.summary, aiTake: parsed.aiTake };
}
