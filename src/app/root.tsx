import { App } from "~/app/app";

export function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body>
        <div id="app">
          <App />
        </div>
      </body>
    </html>
  );
}
