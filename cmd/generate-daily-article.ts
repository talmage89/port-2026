import { fetchArticleContent } from "@/src/features/ai/fetch-content";
import { selectArticle } from "@/src/features/ai/select";
import { summarizeArticle } from "@/src/features/ai/summarize";
import { createArticle } from "@/src/features/articles/repository";

async function main() {
  console.log("Starting daily article generation...\n");

  // Step 1: Select article
  console.log("Step 1: Selecting article from Hacker News...");
  const selected = await selectArticle();
  console.log(`  Selected: "${selected.title}"`);
  console.log(`  URL: ${selected.url}\n`);

  // Step 2: Fetch content
  console.log("Step 2: Fetching article content...");
  const content = await fetchArticleContent(selected.url);
  console.log(`  Fetched ${content.length} characters of text\n`);

  // Step 3: Generate summary + AI take
  console.log("Step 3: Generating summary and AI take...");
  const { summary, aiTake } = await summarizeArticle(selected.title, content);
  console.log(`  Summary: ${summary.slice(0, 100)}...`);
  console.log(`  AI Take: ${aiTake.slice(0, 100)}...\n`);

  // Step 4: Store in database
  console.log("Step 4: Storing article in database...");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const article = await createArticle({
    title: selected.title,
    summary,
    link: selected.url,
    aiTake,
    publishedDate: today,
  });
  console.log(`  Created article: ${article.id}\n`);

  console.log("Daily article generation complete!");
  console.log(JSON.stringify(article, null, 2));
}

await main().catch((error) => {
  console.error("Failed to generate daily article:", error);
  process.exit(1);
});
