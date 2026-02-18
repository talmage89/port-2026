import { afterEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import type { GenerationResult } from "~/features/ai/generate";

const VALID_KEY = "test-admin-key-456";

mock.module("~/platform/utils/env", () => ({
  env: () => ({
    PORT: 3000,
    DB_URL: "postgres://localhost:5432/test",
    ADMIN_API_KEY: VALID_KEY,
  }),
}));

const mockGenerateDailyArticle = mock<() => Promise<GenerationResult>>(() =>
  Promise.resolve({
    success: true as const,
    articleId: "article-123",
    title: "Test Article Title",
    link: "https://example.com/article",
    durationMs: 1500,
  }),
);

mock.module("~/features/ai/generate", () => ({
  generateDailyArticle: mockGenerateDailyArticle,
}));

const { GenerateDailyRoute } = await import("./index");

function createApp() {
  const app = new Hono();
  const route = new GenerateDailyRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

type JsonBody = Record<string, unknown>;

describe("GenerateDailyRoute", () => {
  afterEach(() => {
    mockGenerateDailyArticle.mockClear();
  });

  test("returns 200 with article details on success", async () => {
    const app = createApp();
    const res = await app.request("/admin/generate-daily", {
      method: "POST",
      headers: { Authorization: `Bearer ${VALID_KEY}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as JsonBody;
    expect(body.success).toBe(true);
    expect(body.articleId).toBe("article-123");
    expect(body.title).toBe("Test Article Title");
    expect(body.link).toBe("https://example.com/article");
    expect(body.durationMs).toBe(1500);
    expect(mockGenerateDailyArticle).toHaveBeenCalledTimes(1);
  });

  test("returns 500 with error details on pipeline failure", async () => {
    mockGenerateDailyArticle.mockResolvedValueOnce({
      success: false,
      error: "No suitable articles found",
      step: "select",
      durationMs: 200,
    });

    const app = createApp();
    const res = await app.request("/admin/generate-daily", {
      method: "POST",
      headers: { Authorization: `Bearer ${VALID_KEY}` },
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as JsonBody;
    expect(body.success).toBe(false);
    expect(body.error).toBe("No suitable articles found");
    expect(body.step).toBe("select");
  });

  test("returns 401 without Authorization header", async () => {
    const app = createApp();
    const res = await app.request("/admin/generate-daily", { method: "POST" });

    expect(res.status).toBe(401);
    expect(mockGenerateDailyArticle).not.toHaveBeenCalled();
  });

  test("returns 401 with invalid API key", async () => {
    const app = createApp();
    const res = await app.request("/admin/generate-daily", {
      method: "POST",
      headers: { Authorization: "Bearer wrong-key" },
    });

    expect(res.status).toBe(401);
    expect(mockGenerateDailyArticle).not.toHaveBeenCalled();
  });
});
