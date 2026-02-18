import { afterEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";

const mockUpvoteArticle = mock(() => Promise.resolve({ id: "abc", upvotes: 1 }));

mock.module("~/features/articles/service", () => ({
  upvoteArticle: mockUpvoteArticle,
}));

const { UpvoteRoute } = await import("./index");

function createApp() {
  const app = new Hono();
  const route = new UpvoteRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

describe("UpvoteRoute", () => {
  afterEach(() => {
    mockUpvoteArticle.mockClear();
  });

  test("increments upvote and redirects to /", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/upvote", { method: "POST" });

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");
    expect(mockUpvoteArticle).toHaveBeenCalledWith("abc");
  });

  test("sets voted cookie after successful upvote", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/upvote", { method: "POST" });

    const setCookieHeader = res.headers.get("Set-Cookie");
    expect(setCookieHeader).toContain("voted-abc=1");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=Strict");
    expect(setCookieHeader).toContain("Max-Age=2592000");
    expect(setCookieHeader).toContain("Path=/");
  });

  test("returns 404 when article does not exist", async () => {
    mockUpvoteArticle.mockRejectedValueOnce(new Error("Record not found"));
    const app = createApp();
    const res = await app.request("/articles/nonexistent/upvote", { method: "POST" });

    expect(res.status).toBe(404);
    expect(mockUpvoteArticle).toHaveBeenCalledWith("nonexistent");
  });

  test("redirects without incrementing when voted cookie exists", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/upvote", {
      method: "POST",
      headers: {
        Cookie: "voted-abc=1",
      },
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");
    expect(mockUpvoteArticle).not.toHaveBeenCalled();
  });

  test("does not set cookie when vote is duplicate", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/upvote", {
      method: "POST",
      headers: {
        Cookie: "voted-abc=1",
      },
    });

    const setCookieHeader = res.headers.get("Set-Cookie");
    expect(setCookieHeader).toBeNull();
  });
});
