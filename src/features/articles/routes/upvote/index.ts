import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import * as articleService from "~/features/articles/service";
import { Method, type Route } from "~/platform/routing/router";

export class UpvoteRoute implements Route {
  path = "/articles/:id/upvote";
  method = Method.POST;

  async handler(c: Context): Promise<Response> {
    const articleId = c.req.param("id");
    const cookieName = `voted-${articleId}`;

    if (getCookie(c, cookieName)) {
      return c.redirect("/");
    }

    try {
      await articleService.upvoteArticle(articleId);
    } catch {
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
