export function Footer() {
  return (
    <footer className="border-white/10 border-t">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-white/50 text-xs">
        <span>Curated daily. Minimal by design.</span>
        <a href="/feed.xml" className="text-white/40 transition-colors hover:text-white/60">
          RSS
        </a>
      </div>
    </footer>
  );
}
