import { ArticleRouter } from "@/src/features/articles/routes";
import { Router } from "./router";

const articleRouter = new ArticleRouter();

export const { routes } = new Router([...articleRouter.routes]);
