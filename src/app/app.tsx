import { ArticlePlaceholder } from "~/components/article/ArticlePlaceholder";
import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <ArticlePlaceholder />
      </main>
      <Footer />
    </div>
  );
}
