import { Router } from "@/src/platform/routing/router";
import { HomeRoute } from "./home";
import { UpvoteRoute } from "./upvote";

export class ArticleRouter extends Router {
  constructor(prefix: string = "") {
    super([new HomeRoute(), new UpvoteRoute()], prefix);
  }
}
