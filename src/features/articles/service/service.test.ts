import { afterEach, describe, expect, mock, test } from "bun:test";

const mockGetArticleByDate = mock(() => Promise.resolve(null));
const mockGetLatestArticle = mock(() => Promise.resolve(null));
const mockIncrementUpvotes = mock(() => Promise.resolve({}));

mock.module("~/features/articles/repository", () => ({
  getArticleByDate: mockGetArticleByDate,
  getLatestArticle: mockGetLatestArticle,
  incrementUpvotes: mockIncrementUpvotes,
}));

const { getTodaysArticle, upvoteArticle } = await import("./index");

describe("article service", () => {
  afterEach(() => {
    mockGetArticleByDate.mockClear();
    mockGetLatestArticle.mockClear();
    mockIncrementUpvotes.mockClear();
  });

  describe("getTodaysArticle", () => {
    test("returns article for today when one exists", async () => {
      const todayArticle = { id: "today", title: "Today's Article" };
      mockGetArticleByDate.mockResolvedValueOnce(todayArticle);

      const result = await getTodaysArticle();
      expect(result).toEqual(todayArticle);
      expect(mockGetArticleByDate).toHaveBeenCalledTimes(1);
      expect(mockGetLatestArticle).not.toHaveBeenCalled();
    });

    test("falls back to latest article when none for today", async () => {
      const latestArticle = { id: "latest", title: "Latest" };
      mockGetArticleByDate.mockResolvedValueOnce(null);
      mockGetLatestArticle.mockResolvedValueOnce(latestArticle);

      const result = await getTodaysArticle();
      expect(result).toEqual(latestArticle);
      expect(mockGetArticleByDate).toHaveBeenCalledTimes(1);
      expect(mockGetLatestArticle).toHaveBeenCalledTimes(1);
    });

    test("returns null when no articles exist at all", async () => {
      mockGetArticleByDate.mockResolvedValueOnce(null);
      mockGetLatestArticle.mockResolvedValueOnce(null);

      const result = await getTodaysArticle();
      expect(result).toBeNull();
    });

    test("passes a Date object to getArticleByDate", async () => {
      mockGetArticleByDate.mockResolvedValueOnce({ id: "x" });
      await getTodaysArticle();

      const passedDate = mockGetArticleByDate.mock.calls[0]?.[0];
      expect(passedDate).toBeInstanceOf(Date);
    });
  });

  describe("upvoteArticle", () => {
    test("delegates to incrementUpvotes with article id", async () => {
      const updated = { id: "abc", upvotes: 5 };
      mockIncrementUpvotes.mockResolvedValueOnce(updated);

      const result = await upvoteArticle("abc");
      expect(result).toEqual(updated);
      expect(mockIncrementUpvotes).toHaveBeenCalledWith("abc");
    });
  });
});
