import { parseArgs } from "node:util";
import { z } from "zod";
import { createArticle } from "@/src/features/articles/repository";

const flagSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  link: z.string().url("Link must be a valid URL"),
  "ai-take": z.string().optional(),
  date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return new Date();
      const parsed = new Date(val);
      if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${val}`);
      return parsed;
    }),
});

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    title: { type: "string" },
    summary: { type: "string" },
    link: { type: "string" },
    "ai-take": { type: "string" },
    date: { type: "string" },
  },
});

const args = flagSchema.parse(values);

const article = await createArticle({
  title: args.title,
  summary: args.summary,
  link: args.link,
  aiTake: args["ai-take"],
  publishedDate: args.date,
});

console.log("created article\n");
console.log(JSON.stringify(article, null, 2));
