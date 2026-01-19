export function ArticlePlaceholder() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
          Today&apos;s Article
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">
          A random article will appear here each day.
        </h1>
        <p className="text-sm text-black/60">
          Source link, summary, and a brief AI take will be shown below.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-black/10 p-5">
        <div className="text-sm font-medium">Summary</div>
        <p className="text-sm text-black/70">
          A concise, reader-friendly summary will be generated daily.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-black/10 p-5">
        <div className="text-sm font-medium">AI Take</div>
        <p className="text-sm text-black/70">
          A short perspective will provide additional context.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-black/10 p-4 text-sm">
        <span className="text-black/60">Upvotes</span>
        <span className="font-medium">0</span>
      </div>
    </section>
  );
}
