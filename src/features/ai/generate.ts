import { createArticle as defaultCreateArticle } from "~/features/articles/repository";
import { fetchArticleContent as defaultFetchArticleContent } from "./fetch-content";
import { selectArticle as defaultSelectArticle } from "./select";
import { summarizeArticle as defaultSummarizeArticle } from "./summarize";

export type GenerationSuccess = {
  success: true;
  articleId: string;
  title: string;
  link: string;
  durationMs: number;
};

export type GenerationFailure = {
  success: false;
  error: string;
  step: string;
  durationMs: number;
};

export type GenerationResult = GenerationSuccess | GenerationFailure;

export type GenerationDeps = {
  selectArticle: typeof defaultSelectArticle;
  fetchArticleContent: typeof defaultFetchArticleContent;
  summarizeArticle: typeof defaultSummarizeArticle;
  createArticle: typeof defaultCreateArticle;
};

const defaultDeps: GenerationDeps = {
  selectArticle: defaultSelectArticle,
  fetchArticleContent: defaultFetchArticleContent,
  summarizeArticle: defaultSummarizeArticle,
  createArticle: defaultCreateArticle,
};

export async function generateDailyArticle(
  deps: GenerationDeps = defaultDeps,
): Promise<GenerationResult> {
  const start = Date.now();
  let step = "select";

  try {
    // Step 1: Select article from HN
    step = "select";
    const selected = await deps.selectArticle();
    console.log(
      JSON.stringify({
        level: "info",
        event: "generation.step",
        step: "select",
        title: selected.title,
        url: selected.url,
      }),
    );

    // Step 2: Fetch content
    step = "fetch";
    const content = await deps.fetchArticleContent(selected.url);
    console.log(
      JSON.stringify({
        level: "info",
        event: "generation.step",
        step: "fetch",
        contentLength: content.length,
      }),
    );

    // Step 3: Generate summary + AI take
    step = "summarize";
    const { summary, aiTake } = await deps.summarizeArticle(selected.title, content);
    console.log(
      JSON.stringify({
        level: "info",
        event: "generation.step",
        step: "summarize",
        summaryLength: summary.length,
        aiTakeLength: aiTake.length,
      }),
    );

    // Step 4: Store in database
    step = "store";
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const article = await deps.createArticle({
      title: selected.title,
      summary,
      link: selected.url,
      aiTake,
      publishedDate: today,
    });

    const durationMs = Date.now() - start;

    console.log(
      JSON.stringify({
        level: "info",
        event: "generation.success",
        articleId: article.id,
        title: selected.title,
        link: selected.url,
        durationMs,
      }),
    );

    return {
      success: true,
      articleId: article.id,
      title: selected.title,
      link: selected.url,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);

    console.log(
      JSON.stringify({
        level: "error",
        event: "generation.failure",
        step,
        error,
        durationMs,
      }),
    );

    return {
      success: false,
      error,
      step,
      durationMs,
    };
  }
}
