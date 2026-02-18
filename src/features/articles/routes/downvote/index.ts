import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import * as articleService from "~/features/articles/service";
import { Method, type Route } from "~/platform/routing/router";

export class DownvoteRoute implements Route {
  path = "/articles/:id/downvote";
  method = Method.POST;

  async handler(c: Context): Promise<Response> {
    const articleId = c.req.param("id");
    const cookieName = `voted-${articleId}`;

    if (getCookie(c, cookieName)) {
      return c.redirect("/");
    }

    try {
      await articleService.downvoteArticle(articleId);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "downvote.failed",
          articleId,
          error: String(error),
        }),
      );
      return c.notFound();
    }

    setCookie(c, cookieName, "1", {
      httpOnly: true,
      path: "/",
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.redirect("/");
  }
}
