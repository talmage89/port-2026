import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { Article as ArticleType } from "@/prisma/generated/client";
import { Layout } from "@/src/app/layout";
import { Root } from "@/src/app/root";
import { Article } from "@/src/components/article/Article";
import * as articleService from "~/features/articles/service";
import { Method, type Route } from "~/platform/routing/router";

export class ArticleRoute implements Route {
  path = "/articles/:id";
  method = Method.GET;

  async handler(c: Context): Promise<Response> {
    const articleId = c.req.param("id");
    const article = await articleService.getArticleById(articleId);

    if (!article) {
      return c.notFound();
    }

    const hasVoted = !!getCookie(c, `voted-${article.id}`);
    return c.html(this.render(article, hasVoted));
  }

  private render(article: ArticleType, hasVoted: boolean) {
    return (
      <Root>
        <Layout>
          <Article article={article} hasVoted={hasVoted} />
        </Layout>
      </Root>
    );
  }
}
