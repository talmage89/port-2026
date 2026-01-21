import type { Article as ArticleType } from "@/prisma/generated/client";

export function Article({ article }: { article: ArticleType }) {
  return (
    <section className="space-y-8">
      <h1 className="font-semibold text-3xl leading-tight tracking-tight">{article.title}</h1>
      {article.link && (
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 underline hover:text-blue-800"
        >
          {article.link}
        </a>
      )}
      <div className="text-black/70 text-lg leading-relaxed">
        <p className="whitespace-pre-wrap">{article.summary}</p>
      </div>
    </section>
  );
}
