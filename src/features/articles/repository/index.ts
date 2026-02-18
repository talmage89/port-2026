import { db } from "@/prisma/client";
import type { Article } from "@/prisma/generated/client";
import { id } from "~/platform/utils/id";

export type CreateArticleData = {
  title: string;
  summary: string;
  link: string;
  aiTake?: string;
  publishedDate?: Date;
};

export async function getArticleByDate(date: Date): Promise<Article | null> {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  return db.article.findFirst({
    where: {
      // @ts-expect-error publishedDate exists in schema but generated types are stale (run prisma generate with DB)
      publishedDate: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });
}

export async function getLatestArticle(): Promise<Article | null> {
  return db.article.findFirst({
    orderBy: { createdAt: "desc" },
  });
}

export async function createArticle(data: CreateArticleData): Promise<Article> {
  return db.article.create({
    data: {
      id: id(),
      ...data,
    },
  });
}

export async function getArticles(limit = 20, offset = 0): Promise<Article[]> {
  return db.article.findMany({
    where: {
      // @ts-expect-error publishedDate exists in schema but generated types are stale
      publishedDate: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function getArticleById(id: string): Promise<Article | null> {
  return db.article.findUnique({ where: { id } });
}

export async function incrementUpvotes(articleId: string): Promise<Article> {
  return db.article.update({
    where: { id: articleId },
    data: { upvotes: { increment: 1 } },
  });
}
