import type { Context } from "hono";
import { getCookie } from "hono/cookie";
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
    if (!article) return c.html(this.renderNoArticle());
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

  private renderNoArticle() {
    return (
      <Root>
        <Layout>
          <section className="flex grow flex-col items-center justify-center text-center">
            <h1 className="font-bold text-2xl text-white/90 tracking-tight">
              Today's article is on the way
            </h1>
            <p className="mt-3 text-white/50">Check back soon — we publish a new article daily.</p>
          </section>
        </Layout>
      </Root>
    );
  }
}
