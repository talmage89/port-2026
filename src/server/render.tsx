import { renderToString } from "react-dom/server";
import { App } from "../app/App";

function html(app: React.ReactNode) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body>
        <div id="app">{app}</div>
      </body>
    </html>
  );
}

export function renderPage() {
  return `<!doctype html>${renderToString(html(<App />))}`;
}
