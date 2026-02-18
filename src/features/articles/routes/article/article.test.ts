import { afterEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { mockArticle } from "~/test/helpers";

const mockGetArticleById = mock(() => Promise.resolve(null));

mock.module("~/features/articles/service", () => ({
  getArticleById: mockGetArticleById,
  getTodaysArticle: mock(),
  getArticles: mock(),
  upvoteArticle: mock(),
}));

const { ArticleRoute } = await import("~/features/articles/routes/article");

function createApp() {
  const app = new Hono();
  const route = new ArticleRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

describe("ArticleRoute", () => {
  afterEach(() => {
    mockGetArticleById.mockClear();
  });

  it("returns 200 with article content when article exists", async () => {
    const article = mockArticle({ id: "abc", title: "Individual Article", upvotes: 7 });
    mockGetArticleById.mockResolvedValueOnce(article);

    const app = createApp();
    const res = await app.request("/articles/abc");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Individual Article");
  });

  it("returns 404 when article does not exist", async () => {
    mockGetArticleById.mockResolvedValueOnce(null);

    const app = createApp();
    const res = await app.request("/articles/nonexistent");

    expect(res.status).toBe(404);
  });

  it("calls getArticleById with the correct id", async () => {
    mockGetArticleById.mockResolvedValueOnce(mockArticle({ id: "my-id" }));

    const app = createApp();
    await app.request("/articles/my-id");

    expect(mockGetArticleById).toHaveBeenCalledWith("my-id");
  });

  it("shows Voted button when vote cookie is present", async () => {
    const article = mockArticle({ id: "abc", title: "Voted Article" });
    mockGetArticleById.mockResolvedValueOnce(article);

    const app = createApp();
    const res = await app.request("/articles/abc", {
      headers: { Cookie: "voted-abc=1" },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Voted");
  });

  it("shows Upvote button when no vote cookie", async () => {
    const article = mockArticle({ id: "abc", title: "Fresh Article" });
    mockGetArticleById.mockResolvedValueOnce(article);

    const app = createApp();
    const res = await app.request("/articles/abc");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Upvote");
    expect(html).not.toContain("Voted");
  });
});
