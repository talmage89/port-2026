import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-5xl grow flex-col gap-4 px-6 py-10">
        <Navbar />
        <main className="grow">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
