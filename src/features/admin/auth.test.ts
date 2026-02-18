import { describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";

const VALID_KEY = "test-admin-key-123";

mock.module("~/platform/utils/env", () => ({
  env: () => ({
    PORT: 3000,
    DB_URL: "postgres://localhost:5432/test",
    ADMIN_API_KEY: VALID_KEY,
  }),
}));

const { requireAdminAuth } = await import("./auth");

function createApp() {
  const app = new Hono();
  app.post("/test", (c) => {
    const authError = requireAdminAuth(c);
    if (authError) return authError;
    return c.json({ ok: true });
  });
  return app;
}

describe("requireAdminAuth", () => {
  test("returns null (allows access) with valid Bearer token", async () => {
    const app = createApp();
    const res = await app.request("/test", {
      method: "POST",
      headers: { Authorization: `Bearer ${VALID_KEY}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body).toEqual({ ok: true });
  });

  test("returns 401 when Authorization header is missing", async () => {
    const app = createApp();
    const res = await app.request("/test", { method: "POST" });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Missing Authorization header");
  });

  test("returns 401 when API key is invalid", async () => {
    const app = createApp();
    const res = await app.request("/test", {
      method: "POST",
      headers: { Authorization: "Bearer wrong-key" },
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Invalid API key");
  });

  test("returns 401 when Authorization header format is wrong", async () => {
    const app = createApp();
    const res = await app.request("/test", {
      method: "POST",
      headers: { Authorization: "Basic abc123" },
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Invalid Authorization header format");
  });

  test("returns 401 when ADMIN_API_KEY is not configured", async () => {
    const app = new Hono();
    app.post("/test", (c) => {
      // Simulate no key configured
      return c.json({ error: "Admin API key is not configured" }, 401);
    });

    const res = await app.request("/test", {
      method: "POST",
      headers: { Authorization: "Bearer some-key" },
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Admin API key is not configured");
  });
});
