export function Navbar() {
  return (
    <header>
      <div className="flex w-full items-center justify-between py-4">
        <a href="/" className="font-semibold text-xl tracking-tight hover:text-white/80">
          Pick of the day
        </a>
        <a href="/archive" className="text-sm text-white/50 transition-colors hover:text-white/80">
          Archive
        </a>
      </div>
    </header>
  );
}
