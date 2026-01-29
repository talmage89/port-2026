import type { Article as ArticleType } from "@/prisma/generated/client";

export function Article({ article }: { article: ArticleType }) {
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
      <div className="text-white/70 text-lg leading-relaxed">
        <p className="whitespace-pre-wrap">{article.summary}</p>
      </div>
    </section>
  );
}
