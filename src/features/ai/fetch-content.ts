export async function fetchArticleContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PickOfTheDay/1.0 (article-summarizer)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return stripHtml(html);
}

function stripHtml(html: string): string {
  // Remove script and style elements completely
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&mdash;/g, "\u2014");
  text = text.replace(/&ndash;/g, "\u2013");
  text = text.replace(/&hellip;/g, "\u2026");
  text = text.replace(/&laquo;/g, "\u00AB");
  text = text.replace(/&raquo;/g, "\u00BB");
  text = text.replace(/&copy;/g, "\u00A9");
  text = text.replace(/&reg;/g, "\u00AE");
  text = text.replace(/&trade;/g, "\u2122");
  // Decode numeric HTML entities (decimal &#NNN; and hex &#xHHH;)
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(Number.parseInt(hex, 16)),
  );
  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}
