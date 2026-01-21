import { z } from "zod";
import { db } from "@/prisma/client";
import type { Article } from "@/prisma/generated/client";
import { id } from "~/utils/id";

const argSchema = z.object({
  title: z.string(),
  summary: z.string(),
  link: z.string(),
});

type Args = z.infer<typeof argSchema>;

function parseArgs(): Args {
  const args = process.argv.slice(2);
  if (args.length !== Object.keys(argSchema.shape).length) {
    console.error("Usage: bun cmd/create-article.ts <title> <summary> <link>");
    process.exit(1);
  }

  const [title, summary, link] = args;
  return argSchema.parse({ title, summary, link });
}

async function createArticle(args: Args): Promise<Article> {
  return await db.article.create({
    data: {
      id: id(),
      ...args,
    },
  });
}

async function main() {
  const args = parseArgs();
  const article = await createArticle(args);
  console.log("created article\n");
  console.log(JSON.stringify(article, null, 2));
}

await main();
