import type { Context } from "hono";
import { db } from "@/prisma/client";
import { Layout } from "../app/layout";
import { Root } from "../app/root";
import { Article } from "../components/article/Article";

export const routes: Record<string, { get: (c: Context) => Promise<Response> }> = {
  "/": {
    get: async (c) => {
      const article = await db.article.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!article) {
        return c.notFound();
      }

      const html = (
        <Root>
          <Layout>
            <Article article={article} />
          </Layout>
        </Root>
      );

      return c.html(html);
    },
  },
};
