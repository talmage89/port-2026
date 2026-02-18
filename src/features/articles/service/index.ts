import type { Article } from "@/prisma/generated/client";
import * as articleRepository from "~/features/articles/repository";

export async function getTodaysArticle(): Promise<Article | null> {
  const today = new Date();
  const article = await articleRepository.getArticleByDate(today);
  if (article) return article;
  return articleRepository.getLatestArticle();
}

export async function upvoteArticle(articleId: string): Promise<Article> {
  return articleRepository.incrementUpvotes(articleId);
}
