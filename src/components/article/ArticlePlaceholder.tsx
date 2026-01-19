export function ArticlePlaceholder() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-black/50 text-xs uppercase tracking-[0.3em]">Today&apos;s Article</p>
        <h1 className="font-semibold text-3xl leading-tight tracking-tight">
          A random article will appear here each day.
        </h1>
        <p className="text-black/60 text-sm">
          Source link, summary, and a brief AI take will be shown below.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-black/10 p-5">
        <div className="font-medium text-sm">Summary</div>
        <p className="text-black/70 text-sm">
          A concise, reader-friendly summary will be generated daily.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-black/10 p-5">
        <div className="font-medium text-sm">AI Take</div>
        <p className="text-black/70 text-sm">
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
