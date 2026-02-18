import { afterEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { mockArticle } from "~/test/helpers";

// biome-ignore lint/suspicious/noExplicitAny: intentional for test mock compatibility
const mockGetArticles = mock(() => Promise.resolve([] as any[]));

mock.module("~/features/articles/service", () => ({
  getArticles: mockGetArticles,
  getTodaysArticle: mock(),
  getArticleById: mock(),
  upvoteArticle: mock(),
}));

const { ArchiveRoute } = await import("~/features/articles/routes/archive");

function createApp() {
  const app = new Hono();
  const route = new ArchiveRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

describe("ArchiveRoute", () => {
  afterEach(() => {
    mockGetArticles.mockClear();
  });

  it("returns 200 with article list when articles exist", async () => {
    const articles = [
      mockArticle({ id: "a1", title: "First Article", upvotes: 5 }),
      mockArticle({ id: "a2", title: "Second Article", upvotes: 2 }),
    ];
    mockGetArticles.mockResolvedValueOnce(articles);

    const app = createApp();
    const res = await app.request("/archive");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Archive");
    expect(html).toContain("First Article");
    expect(html).toContain("Second Article");
  });

  it("returns 200 with empty message when no articles exist", async () => {
    mockGetArticles.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await app.request("/archive");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("No articles yet");
  });

  it("renders article links pointing to individual article pages", async () => {
    const articles = [mockArticle({ id: "article-123", title: "Linked Article" })];
    mockGetArticles.mockResolvedValueOnce(articles);

    const app = createApp();
    const res = await app.request("/archive");

    const html = await res.text();
    expect(html).toContain("/articles/article-123");
  });

  it("shows upvote count for each article", async () => {
    const articles = [mockArticle({ id: "a1", title: "Popular", upvotes: 42 })];
    mockGetArticles.mockResolvedValueOnce(articles);

    const app = createApp();
    const res = await app.request("/archive");

    const html = await res.text();
    expect(html).toContain("42");
    expect(html).toContain("votes");
  });

  it("truncates long summaries", async () => {
    const longSummary = "A".repeat(200);
    const articles = [mockArticle({ id: "a1", summary: longSummary })];
    mockGetArticles.mockResolvedValueOnce(articles);

    const app = createApp();
    const res = await app.request("/archive");

    const html = await res.text();
    expect(html).not.toContain(longSummary);
    expect(html).toContain("...");
  });
});
