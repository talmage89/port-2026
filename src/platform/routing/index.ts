import { AdminRouter } from "@/src/features/admin/routes";
import { ArticleRouter } from "@/src/features/articles/routes";
import { FeedRouter } from "@/src/features/feed/routes";
import { Router } from "./router";

const articleRouter = new ArticleRouter();
const adminRouter = new AdminRouter();
const feedRouter = new FeedRouter();

export const { routes } = new Router([
  ...articleRouter.routes,
  ...adminRouter.routes,
  ...feedRouter.routes,
]);
