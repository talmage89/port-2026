import { afterEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { mockArticle } from "~/test/helpers";

const mockGetTodaysArticle = mock(() => Promise.resolve(null));

mock.module("~/features/articles/service", () => ({
  getTodaysArticle: mockGetTodaysArticle,
  upvoteArticle: mock(),
}));

const { HomeRoute } = await import("~/features/articles/routes/home");

function createApp() {
  const app = new Hono();
  const route = new HomeRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

describe("HomeRoute", () => {
  afterEach(() => {
    mockGetTodaysArticle.mockClear();
  });

  it("returns 200 with article content when getTodaysArticle returns an article", async () => {
    const article = mockArticle({ id: "abc", title: "Test Article Title", upvotes: 3 });
    mockGetTodaysArticle.mockResolvedValueOnce(article);

    const app = createApp();
    const res = await app.request("/");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Test Article Title");
  });

  it("returns 200 with 'on the way' fallback when getTodaysArticle returns null", async () => {
    mockGetTodaysArticle.mockResolvedValueOnce(null);

    const app = createApp();
    const res = await app.request("/");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("on the way");
  });

  it("hasVoted=true when vote cookie is present", async () => {
    const article = mockArticle({ id: "abc", title: "Cookie Article" });
    mockGetTodaysArticle.mockResolvedValueOnce(article);

    const app = createApp();
    const res = await app.request("/", {
      headers: { Cookie: "voted-abc=1" },
    });

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Voted");
  });

  it("hasVoted=false when no vote cookie", async () => {
    const article = mockArticle({ id: "abc", title: "No Cookie Article" });
    mockGetTodaysArticle.mockResolvedValueOnce(article);

    const app = createApp();
    const res = await app.request("/");

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Upvote");
    expect(html).not.toContain("Voted");
  });
});
