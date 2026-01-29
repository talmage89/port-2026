import { Router } from "@/src/platform/routing/router";
import { HomeRoute } from "./home";

export class ArticleRouter extends Router {
  constructor(prefix: string = "") {
    super([new HomeRoute()], prefix);
  }
}
