import type { Article } from "@/prisma/generated/client";

type ArticleCardProps = {
  article: Article;
};

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function truncateSummary(summary: string, maxLength = 150): string {
  if (summary.length <= maxLength) return summary;
  return `${summary.slice(0, maxLength).trimEnd()}...`;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // @ts-expect-error publishedDate exists in schema but generated types are stale
  const publishedDate = article.publishedDate as Date | null;

  return (
    <a
      href={`/articles/${article.id}`}
      className="block rounded-lg border border-white/10 px-6 py-5 transition-colors hover:border-white/20 hover:bg-white/5"
    >
      <div className="space-y-2">
        <h2 className="font-semibold text-lg leading-snug tracking-tight">{article.title}</h2>
        <div className="flex items-center gap-3 text-sm text-white/40">
          {publishedDate && <time>{formatDate(publishedDate)}</time>}
          <span>
            {article.upvotes} {article.upvotes === 1 ? "vote" : "votes"}
          </span>
        </div>
        <p className="text-white/60 leading-relaxed">{truncateSummary(article.summary)}</p>
      </div>
    </a>
  );
}
