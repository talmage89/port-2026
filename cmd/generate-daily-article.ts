import { generateDailyArticle } from "@/src/features/ai/generate";

async function main() {
  console.log("Starting daily article generation...\n");

  const result = await generateDailyArticle();

  if (result.success) {
    console.log(`\nDaily article generation complete in ${result.durationMs}ms!`);
    console.log(`  Article: ${result.title}`);
    console.log(`  Link: ${result.link}`);
    console.log(`  ID: ${result.articleId}`);
  } else {
    console.error(`\nGeneration failed at step "${result.step}": ${result.error}`);
    process.exit(1);
  }
}

await main().catch((error) => {
  console.error("Failed to generate daily article:", error);
  process.exit(1);
});
