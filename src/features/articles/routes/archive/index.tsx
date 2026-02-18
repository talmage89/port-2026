import type { Context } from "hono";
import { Layout } from "@/src/app/layout";
import { Root } from "@/src/app/root";
import { ArticleCard } from "@/src/components/article/ArticleCard";
import * as articleService from "~/features/articles/service";
import { Method, type Route } from "~/platform/routing/router";

export class ArchiveRoute implements Route {
  path = "/archive";
  method = Method.GET;

  async handler(c: Context): Promise<Response> {
    const articles = await articleService.getArticles();
    return c.html(this.render(articles));
  }

  private render(articles: Awaited<ReturnType<typeof articleService.getArticles>>) {
    return (
      <Root>
        <Layout>
          <section className="space-y-6">
            <h1 className="font-bold text-3xl tracking-tight">Archive</h1>
            {articles.length === 0 ? (
              <p className="text-white/50">No articles yet. Check back soon.</p>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        </Layout>
      </Root>
    );
  }
}
