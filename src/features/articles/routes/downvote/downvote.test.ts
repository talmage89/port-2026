import { afterEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import { mockArticle } from "~/test/helpers";

const mockDownvoteArticle = mock(() => Promise.resolve(mockArticle({ id: "abc", downvotes: 1 })));

mock.module("~/features/articles/service", () => ({
  downvoteArticle: mockDownvoteArticle,
}));

const { DownvoteRoute } = await import("./index");

function createApp() {
  const app = new Hono();
  const route = new DownvoteRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

describe("DownvoteRoute", () => {
  afterEach(() => {
    mockDownvoteArticle.mockClear();
  });

  test("increments downvote and redirects to /", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/downvote", { method: "POST" });

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");
    expect(mockDownvoteArticle).toHaveBeenCalledWith("abc");
  });

  test("sets voted cookie after successful downvote", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/downvote", { method: "POST" });

    const setCookieHeader = res.headers.get("Set-Cookie");
    expect(setCookieHeader).toContain("voted-abc=1");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=Strict");
    expect(setCookieHeader).toContain("Max-Age=2592000");
    expect(setCookieHeader).toContain("Path=/");
  });

  test("returns 404 when article does not exist", async () => {
    mockDownvoteArticle.mockRejectedValueOnce(new Error("Record not found"));
    const app = createApp();
    const res = await app.request("/articles/nonexistent/downvote", { method: "POST" });

    expect(res.status).toBe(404);
    expect(mockDownvoteArticle).toHaveBeenCalledWith("nonexistent");
  });

  test("redirects without incrementing when voted cookie exists", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/downvote", {
      method: "POST",
      headers: {
        Cookie: "voted-abc=1",
      },
    });

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/");
    expect(mockDownvoteArticle).not.toHaveBeenCalled();
  });

  test("does not set cookie when vote is duplicate", async () => {
    const app = createApp();
    const res = await app.request("/articles/abc/downvote", {
      method: "POST",
      headers: {
        Cookie: "voted-abc=1",
      },
    });

    const setCookieHeader = res.headers.get("Set-Cookie");
    expect(setCookieHeader).toBeNull();
  });
});
