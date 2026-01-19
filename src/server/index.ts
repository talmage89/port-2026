import { join } from "node:path";
import { renderPage } from "./render";

const publicDir = join(process.cwd(), "public");
const cssPath = join(publicDir, "tailwind.css");

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/tailwind.css") {
      return new Response(Bun.file(cssPath), {
        headers: {
          "content-type": "text/css; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      });
    }

    return new Response(renderPage(), {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
