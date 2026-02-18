import type { Context } from "hono";
import * as articleService from "~/features/articles/service";
import { Method, type Route } from "~/platform/routing/router";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(date: Date): string {
  return date.toUTCString();
}

export class FeedRoute implements Route {
  path = "/feed.xml";
  method = Method.GET;

  async handler(c: Context): Promise<Response> {
    const articles = await articleService.getArticles(20);

    const items = articles
      .map(
        (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.link)}</link>
      <description>${escapeXml(article.summary)}</description>
      <pubDate>${toRfc2822(article.createdAt)}</pubDate>
      <guid isPermaLink="false">${article.id}</guid>
    </item>`,
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pick of the day</title>
    <description>Curated daily. Minimal by design.</description>
    <link>https://port.talmage.dev</link>
    <atom:link href="https://port.talmage.dev/feed.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
${items}
  </channel>
</rss>`;

    return c.body(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8" });
  }
}
