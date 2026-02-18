import type { Article as ArticleType } from "@/prisma/generated/client";

type ArticleProps = {
  article: ArticleType;
  hasVoted?: boolean;
};

export function Article({ article, hasVoted = false }: ArticleProps) {
  return (
    <section className="space-y-8">
      <h1 className="font-bold text-3xl leading-tight tracking-tight">{article.title}</h1>
      <span className="flex items-center gap-1 text-sm">
        <p>Source:</p>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-400 underline hover:text-blue-300"
        >
          {article.link}
        </a>
      </span>
      <div className="text-lg text-white/70 leading-relaxed">
        <p className="whitespace-pre-wrap">{article.summary}</p>
      </div>
      {article.aiTake && (
        <div className="border-blue-400/40 border-l-2 pl-5">
          <p className="mb-2 font-medium text-white/40 text-xs uppercase tracking-widest">
            AI Take
          </p>
          <p className="whitespace-pre-wrap text-white/70 italic leading-relaxed">
            {article.aiTake}
          </p>
        </div>
      )}
      <div className="flex items-center gap-1">
        <form method="post" action={`/articles/${article.id}/upvote`}>
          <button
            type="submit"
            disabled={hasVoted}
            className={`rounded border px-3 py-2 font-medium text-sm transition-colors ${
              hasVoted
                ? "cursor-not-allowed border-white/10 text-white/40"
                : "border-white/20 text-white hover:border-white/40 hover:bg-white/10"
            }`}
            aria-label="Upvote"
          >
            &#9650;
          </button>
        </form>
        <span className="min-w-[2rem] text-center text-sm text-white/50">
          {article.upvotes - article.downvotes}
        </span>
        <form method="post" action={`/articles/${article.id}/downvote`}>
          <button
            type="submit"
            disabled={hasVoted}
            className={`rounded border px-3 py-2 font-medium text-sm transition-colors ${
              hasVoted
                ? "cursor-not-allowed border-white/10 text-white/40"
                : "border-white/20 text-white hover:border-white/40 hover:bg-white/10"
            }`}
            aria-label="Downvote"
          >
            &#9660;
          </button>
        </form>
      </div>
    </section>
  );
}
