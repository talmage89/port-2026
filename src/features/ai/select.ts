import { db } from "@/prisma/client";

type HNItem = {
  id: number;
  title: string;
  url?: string;
  type: string;
};

type SelectedArticle = {
  url: string;
  title: string;
};

export async function selectArticle(): Promise<SelectedArticle> {
  const topStoriesResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const topStoryIds = (await topStoriesResponse.json()) as number[];

  // Take a random sample of 30 stories to check
  const sampleIds = shuffle(topStoryIds).slice(0, 30);

  // Fetch details for sampled stories
  const items = await Promise.all(
    sampleIds.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return res.json() as Promise<HNItem>;
    }),
  );

  // Filter to stories with URLs
  const withUrls = items.filter(
    (item): item is HNItem & { url: string } => !!item.url && item.type === "story",
  );

  if (withUrls.length === 0) {
    throw new Error("No suitable articles found from Hacker News");
  }

  // Get existing article links to avoid repeats
  const existingArticles = await db.article.findMany({
    select: { link: true },
  });
  const existingLinks = new Set(existingArticles.map((a) => a.link));

  // Find an article that hasn't been used
  const unused = withUrls.find((item) => !existingLinks.has(item.url));
  // biome-ignore lint/style/noNonNullAssertion: withUrls is guaranteed non-empty from the check above
  const selected = unused ?? withUrls[0]!;

  return { url: selected.url, title: selected.title };
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i] as T;
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp;
  }
  return shuffled;
}
