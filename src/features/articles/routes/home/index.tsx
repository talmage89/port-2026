import type { Context } from "hono";
import type { Article as ArticleType } from "@/prisma/generated/client";
import { Layout } from "@/src/app/layout";
import { Root } from "@/src/app/root";
import { Article } from "@/src/components/article/Article";
import * as articleService from "~/features/articles/service";
import { Method, type Route } from "~/platform/routing/router";

export class HomeRoute implements Route {
  path = "/";
  method = Method.GET;

  async handler(c: Context): Promise<Response> {
    const article = await articleService.getTodaysArticle();
    if (!article) return c.notFound();
    return c.html(this.render(article));
  }

  private render(article: ArticleType) {
    return (
      <Root>
        <Layout>
          <Article article={article} />
        </Layout>
      </Root>
    );
  }
}
