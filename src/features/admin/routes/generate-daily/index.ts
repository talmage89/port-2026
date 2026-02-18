import type { Context } from "hono";
import { requireAdminAuth } from "~/features/admin/auth";
import { generateDailyArticle } from "~/features/ai/generate";
import { Method, type Route } from "~/platform/routing/router";

export class GenerateDailyRoute implements Route {
  path = "/admin/generate-daily";
  method = Method.POST;

  async handler(c: Context): Promise<Response> {
    const authError = requireAdminAuth(c);
    if (authError) {
      return authError;
    }

    const result = await generateDailyArticle();

    if (result.success) {
      return c.json(
        {
          success: true,
          articleId: result.articleId,
          title: result.title,
          link: result.link,
          durationMs: result.durationMs,
        },
        200,
      );
    }

    return c.json(
      {
        success: false,
        error: result.error,
        step: result.step,
        durationMs: result.durationMs,
      },
      500,
    );
  }
}
