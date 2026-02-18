import type { Context } from "hono";
import { env } from "~/platform/utils/env";

/**
 * Validates the Authorization header against the configured ADMIN_API_KEY.
 * Returns null if the request is authorized, or a 401 Response if not.
 */
export function requireAdminAuth(c: Context): Response | null {
  const { ADMIN_API_KEY } = env();

  if (!ADMIN_API_KEY) {
    return c.json({ error: "Admin API key is not configured" }, 401);
  }

  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/);

  if (!match) {
    return c.json({ error: "Invalid Authorization header format" }, 401);
  }

  const token = match[1];

  if (token !== ADMIN_API_KEY) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  return null;
}
