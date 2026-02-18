import { AdminRouter } from "@/src/features/admin/routes";
import { ArticleRouter } from "@/src/features/articles/routes";
import { Router } from "./router";

const articleRouter = new ArticleRouter();
const adminRouter = new AdminRouter();

export const { routes } = new Router([...articleRouter.routes, ...adminRouter.routes]);
