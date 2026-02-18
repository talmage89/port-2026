import type { Article } from "@/prisma/generated/client";
import * as articleRepository from "~/features/articles/repository";

/**
 * Returns the article published for today, or falls back to the most recent article.
 *
 * Daily rotation uses UTC as the reference timezone. The repository normalizes
 * the date to a UTC day boundary (00:00–23:59 UTC), so all users worldwide see
 * the same article rotate at midnight UTC.
 */
export async function getTodaysArticle(): Promise<Article | null> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const article = await articleRepository.getArticleByDate(today);
  if (article) return article;
  return articleRepository.getLatestArticle();
}

export async function getArticles(limit = 20, offset = 0): Promise<Article[]> {
  return articleRepository.getArticles(limit, offset);
}

export async function getArticleById(id: string): Promise<Article | null> {
  return articleRepository.getArticleById(id);
}

export async function upvoteArticle(articleId: string): Promise<Article> {
  return articleRepository.incrementUpvotes(articleId);
}
