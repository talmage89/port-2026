import { afterEach, describe, expect, mock, test } from "bun:test";
import type { GenerationDeps } from "~/features/ai/generate";

const { generateDailyArticle } = await import("~/features/ai/generate");

const mockSelectArticle = mock(() =>
  Promise.resolve({
    title: "Test HN Article",
    url: "https://example.com/test-article",
  }),
);

const mockFetchArticleContent = mock((_url: string) =>
  Promise.resolve("Article text content here"),
);

const mockSummarizeArticle = mock((_title: string, _content: string) =>
  Promise.resolve({
    summary: "This is a test summary.",
    aiTake: "This is an interesting test take.",
  }),
);

const mockCreateArticle = mock(() =>
  Promise.resolve({
    id: "generated-article-id",
    title: "Test HN Article",
    summary: "This is a test summary.",
    link: "https://example.com/test-article",
    aiTake: "This is an interesting test take.",
    publishedDate: new Date("2026-02-17"),
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date(),
  }),
);

const deps: GenerationDeps = {
  selectArticle: mockSelectArticle,
  fetchArticleContent: mockFetchArticleContent,
  summarizeArticle: mockSummarizeArticle,
  createArticle: mockCreateArticle,
};

describe("generateDailyArticle", () => {
  afterEach(() => {
    mockSelectArticle.mockClear();
    mockFetchArticleContent.mockClear();
    mockSummarizeArticle.mockClear();
    mockCreateArticle.mockClear();
  });

  test("returns success result with article details", async () => {
    const result = await generateDailyArticle(deps);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.articleId).toBe("generated-article-id");
      expect(result.title).toBe("Test HN Article");
      expect(result.link).toBe("https://example.com/test-article");
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  test("calls pipeline steps in order", async () => {
    await generateDailyArticle(deps);

    expect(mockSelectArticle).toHaveBeenCalledTimes(1);
    expect(mockFetchArticleContent).toHaveBeenCalledWith("https://example.com/test-article");
    expect(mockSummarizeArticle).toHaveBeenCalledWith(
      "Test HN Article",
      "Article text content here",
    );
    expect(mockCreateArticle).toHaveBeenCalledTimes(1);
  });

  test("returns failure when select step fails", async () => {
    mockSelectArticle.mockRejectedValueOnce(new Error("No suitable articles found"));

    const result = await generateDailyArticle(deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.step).toBe("select");
      expect(result.error).toBe("No suitable articles found");
    }
  });

  test("returns failure when fetch step fails", async () => {
    mockFetchArticleContent.mockRejectedValueOnce(new Error("Failed to fetch article: 404"));

    const result = await generateDailyArticle(deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.step).toBe("fetch");
      expect(result.error).toBe("Failed to fetch article: 404");
    }
  });

  test("returns failure when summarize step fails", async () => {
    mockSummarizeArticle.mockRejectedValueOnce(new Error("AI response missing required fields"));

    const result = await generateDailyArticle(deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.step).toBe("summarize");
      expect(result.error).toBe("AI response missing required fields");
    }
  });

  test("returns failure when store step fails", async () => {
    mockCreateArticle.mockRejectedValueOnce(new Error("Database connection error"));

    const result = await generateDailyArticle(deps);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.step).toBe("store");
      expect(result.error).toBe("Database connection error");
    }
  });

  test("includes duration in both success and failure results", async () => {
    const successResult = await generateDailyArticle(deps);
    expect(successResult.durationMs).toBeGreaterThanOrEqual(0);

    mockSelectArticle.mockRejectedValueOnce(new Error("fail"));
    const failResult = await generateDailyArticle(deps);
    expect(failResult.durationMs).toBeGreaterThanOrEqual(0);
  });
});
