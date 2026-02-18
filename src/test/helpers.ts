/**
 * Test helpers for creating mock data objects with sensible defaults.
 *
 * We define our own MockArticle shape here instead of importing the Prisma-generated
 * Article type, because generated types may lag behind the schema (e.g. publishedDate
 * may not be generated yet). The helper returns plain objects that satisfy the runtime
 * shape of an Article row regardless of generated-type staleness.
 */

type MockArticle = {
  id: string;
  title: string;
  summary: string;
  link: string;
  upvotes: number;
  downvotes: number;
  aiTake: string | null;
  publishedDate: Date | null;
  createdAt: Date;
};

const DEFAULTS: MockArticle = {
  id: "test-article-id",
  title: "Test Article",
  summary: "A test summary of the article.",
  link: "https://example.com/test-article",
  upvotes: 0,
  downvotes: 0,
  aiTake: null,
  publishedDate: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

/**
 * Creates a full Article-shaped object with sensible defaults.
 * Pass overrides for any fields you need to customize in a specific test.
 *
 * Returns `any` so mock functions with various inferred types (e.g. `null`)
 * can accept the result without type conflicts.
 */
// biome-ignore lint/suspicious/noExplicitAny: intentional for test mock compatibility
export function mockArticle(overrides: Partial<MockArticle> = {}): any {
  return { ...DEFAULTS, ...overrides };
}
