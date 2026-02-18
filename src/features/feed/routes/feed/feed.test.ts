import { afterEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { mockArticle } from "~/test/helpers";

// biome-ignore lint/suspicious/noExplicitAny: intentional for test mock compatibility
const mockGetArticles = mock(() => Promise.resolve([] as any[]));

mock.module("~/features/articles/service", () => ({
  getArticles: mockGetArticles,
}));

const { FeedRoute } = await import("~/features/feed/routes/feed");

function createApp() {
  const app = new Hono();
  const route = new FeedRoute();
  app[route.method](route.path, route.handler.bind(route));
  return app;
}

describe("FeedRoute", () => {
  afterEach(() => {
    mockGetArticles.mockClear();
  });

  it("returns valid XML with correct Content-Type header", async () => {
    mockGetArticles.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await app.request("/feed.xml");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");

    const xml = await res.text();
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>Pick of the day</title>");
    expect(xml).toContain("<description>Curated daily. Minimal by design.</description>");
    expect(xml).toContain("<link>https://port.talmage.dev</link>");
  });

  it("includes article items in RSS feed", async () => {
    const articles = [
      mockArticle({
        id: "art-1",
        title: "First Article",
        summary: "Summary one",
        link: "https://example.com/1",
        createdAt: new Date("2026-02-15T12:00:00.000Z"),
      }),
      mockArticle({
        id: "art-2",
        title: "Second Article",
        summary: "Summary two",
        link: "https://example.com/2",
        createdAt: new Date("2026-02-14T12:00:00.000Z"),
      }),
    ];
    mockGetArticles.mockResolvedValueOnce(articles);

    const app = createApp();
    const res = await app.request("/feed.xml");
    const xml = await res.text();

    expect(xml).toContain("<title>First Article</title>");
    expect(xml).toContain("<title>Second Article</title>");
    expect(xml).toContain("<link>https://example.com/1</link>");
    expect(xml).toContain("<link>https://example.com/2</link>");
    expect(xml).toContain("<description>Summary one</description>");
    expect(xml).toContain("<description>Summary two</description>");
    expect(xml).toContain('<guid isPermaLink="false">art-1</guid>');
    expect(xml).toContain('<guid isPermaLink="false">art-2</guid>');
    expect(xml).toContain("<pubDate>");
  });

  it("returns empty channel when no articles", async () => {
    mockGetArticles.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await app.request("/feed.xml");
    const xml = await res.text();

    expect(xml).toContain("<channel>");
    expect(xml).toContain("</channel>");
    expect(xml).not.toContain("<item>");
  });

  it("properly escapes XML special characters in title and description", async () => {
    const articles = [
      mockArticle({
        id: "art-escape",
        title: 'Breaking: "Rock & Roll" <Lives> On',
        summary: "Tom's guide to <html> & 'xml' encoding",
        link: "https://example.com/test?a=1&b=2",
      }),
    ];
    mockGetArticles.mockResolvedValueOnce(articles);

    const app = createApp();
    const res = await app.request("/feed.xml");
    const xml = await res.text();

    expect(xml).toContain("<title>Breaking: &quot;Rock &amp; Roll&quot; &lt;Lives&gt; On</title>");
    expect(xml).toContain(
      "<description>Tom&apos;s guide to &lt;html&gt; &amp; &apos;xml&apos; encoding</description>",
    );
    expect(xml).toContain("<link>https://example.com/test?a=1&amp;b=2</link>");
  });
});
