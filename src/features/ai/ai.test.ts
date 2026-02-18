import { beforeEach, describe, expect, mock, test } from "bun:test";

// Mock the Anthropic SDK
const mockCreate = mock(() =>
  Promise.resolve({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          summary: "Test summary of the article.",
          aiTake: "This is an interesting development.",
        }),
      },
    ],
  }),
);

mock.module("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

// Mock fetch for article content and HN API
const mockFetch = mock((_url: string | URL | Request) => {
  const url = String(_url);
  if (url.includes("topstories")) {
    return Promise.resolve(new Response(JSON.stringify([1, 2, 3, 4, 5]), { status: 200 }));
  }
  if (url.includes("hacker-news.firebaseio.com/v0/item")) {
    const id = url.match(/item\/(\d+)/)?.[1];
    return Promise.resolve(
      new Response(
        JSON.stringify({
          id: Number(id),
          title: `Story ${id}`,
          url: `https://example.com/article-${id}`,
          type: "story",
        }),
        { status: 200 },
      ),
    );
  }
  // Article content fetch
  return Promise.resolve(
    new Response("<html><body><p>Article content here</p></body></html>", { status: 200 }),
  );
});

// Mock the db for select.ts
mock.module("@/prisma/client", () => ({
  db: {
    article: {
      findMany: mock(() => Promise.resolve([])),
      findFirst: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve({ id: "test-id" })),
      update: mock(() => Promise.resolve({})),
    },
  },
}));

mock.module("~/platform/utils/id", () => ({
  id: () => "test-id",
}));

// Override global fetch
globalThis.fetch = mockFetch as unknown as typeof fetch;

const { summarizeArticle } = await import("./summarize");
const { fetchArticleContent } = await import("./fetch-content");
const { selectArticle } = await import("./select");

describe("AI pipeline", () => {
  beforeEach(() => {
    mockCreate.mockClear();
    mockFetch.mockClear();
  });

  describe("summarizeArticle", () => {
    test("returns summary and aiTake from AI response", async () => {
      process.env.ANTHROPIC_API_KEY = "test-key";

      const result = await summarizeArticle("Test Article", "Some article content");
      expect(result.summary).toBe("Test summary of the article.");
      expect(result.aiTake).toBe("This is an interesting development.");
    });

    test("calls Anthropic with the article content", async () => {
      process.env.ANTHROPIC_API_KEY = "test-key";

      await summarizeArticle("My Title", "My content");
      expect(mockCreate).toHaveBeenCalledTimes(1);
      const callArgs = mockCreate.mock.calls[0] as unknown[];
      const firstArg = callArgs[0] as Record<string, unknown>;
      expect(firstArg.model).toBe("claude-sonnet-4-20250514");
      const messages = firstArg.messages as Array<{ content: string }>;
      expect(messages[0]?.content).toContain("My Title");
      expect(messages[0]?.content).toContain("My content");
    });
  });

  describe("fetchArticleContent", () => {
    test("strips HTML and returns text content", async () => {
      const content = await fetchArticleContent("https://example.com");
      expect(content).toContain("Article content here");
      expect(content).not.toContain("<p>");
      expect(content).not.toContain("<html>");
    });

    test("throws on non-OK response", async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve(new Response(null, { status: 404, statusText: "Not Found" })),
      );
      expect(fetchArticleContent("https://example.com/bad")).rejects.toThrow("Failed to fetch");
    });
  });

  describe("selectArticle", () => {
    test("returns an article with url and title", async () => {
      const result = await selectArticle();
      expect(result.url).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.url).toContain("https://");
    });
  });
});
