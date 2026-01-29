import type { Context } from "hono";
import { db } from "@/prisma/client";
import type { Prisma } from "@/prisma/generated/client";
import { Layout } from "@/src/app/layout";
import { Root } from "@/src/app/root";
import { Article } from "@/src/components/article/Article";
import { Method, type Route } from "@/src/platform/routing/router";

const articleSelect = {
  id: true,
  title: true,
  summary: true,
  link: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
} satisfies Prisma.ArticleSelect;

type HomePageArticle = Prisma.ArticleGetPayload<{
  select: typeof articleSelect;
}>;

export class HomeRoute implements Route {
  path = "/";
  method = Method.GET;

  async handler(c: Context): Promise<Response> {
    const article = await db.article.findFirst({
      orderBy: { createdAt: "desc" },
      select: articleSelect,
    });

    if (!article) {
      return c.notFound();
    }

    return c.html(this.render(article));
  }

  private render(article: HomePageArticle) {
    return (
      <Root>
        <Layout>
          <Article article={article} />
        </Layout>
      </Root>
    );
  }
}
