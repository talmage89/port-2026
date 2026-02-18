import { afterEach, describe, expect, mock, test } from "bun:test";

const mockFindFirst = mock(() => Promise.resolve(null));
const mockCreate = mock(() => Promise.resolve({}));
const mockUpdate = mock(() => Promise.resolve({}));

mock.module("@/prisma/client", () => ({
  db: {
    article: {
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

mock.module("~/platform/utils/id", () => ({
  id: () => "test-id",
}));

const { getArticleByDate, getLatestArticle, createArticle, incrementUpvotes } = await import(
  "./index"
);

describe("article repository", () => {
  afterEach(() => {
    mockFindFirst.mockClear();
    mockCreate.mockClear();
    mockUpdate.mockClear();
  });

  describe("getArticleByDate", () => {
    test("queries with start and end of day range", async () => {
      const date = new Date("2026-02-17T15:30:00Z");
      await getArticleByDate(date);

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      const call = mockFindFirst.mock.calls[0];
      const where = call?.[0]?.where?.publishedDate;
      expect(where?.gte).toEqual(new Date("2026-02-17T00:00:00.000Z"));
      expect(where?.lt).toEqual(new Date("2026-02-18T00:00:00.000Z"));
    });

    test("returns null when no article found", async () => {
      mockFindFirst.mockResolvedValueOnce(null);
      const result = await getArticleByDate(new Date());
      expect(result).toBeNull();
    });

    test("returns article when found", async () => {
      const mockArticle = { id: "abc", title: "Test" };
      mockFindFirst.mockResolvedValueOnce(mockArticle);
      const result = await getArticleByDate(new Date());
      expect(result).toEqual(mockArticle);
    });
  });

  describe("getLatestArticle", () => {
    test("queries ordered by createdAt desc", async () => {
      await getLatestArticle();
      expect(mockFindFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("createArticle", () => {
    test("passes data with generated id", async () => {
      const data = { title: "Test", summary: "Sum", link: "https://example.com" };
      await createArticle(data);
      expect(mockCreate).toHaveBeenCalledWith({
        data: { id: "test-id", ...data },
      });
    });

    test("includes optional aiTake and publishedDate", async () => {
      const data = {
        title: "Test",
        summary: "Sum",
        link: "https://example.com",
        aiTake: "Hot take",
        publishedDate: new Date("2026-02-17"),
      };
      await createArticle(data);
      expect(mockCreate).toHaveBeenCalledWith({
        data: { id: "test-id", ...data },
      });
    });
  });

  describe("incrementUpvotes", () => {
    test("updates with increment operation", async () => {
      await incrementUpvotes("article-123");
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "article-123" },
        data: { upvotes: { increment: 1 } },
      });
    });
  });
});
