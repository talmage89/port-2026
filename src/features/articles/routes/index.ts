import { Router } from "@/src/platform/routing/router";
import { ArchiveRoute } from "./archive";
import { ArticleRoute } from "./article";
import { DownvoteRoute } from "./downvote";
import { HomeRoute } from "./home";
import { UpvoteRoute } from "./upvote";

export class ArticleRouter extends Router {
  constructor(prefix: string = "") {
    super(
      [
        new HomeRoute(),
        new ArchiveRoute(),
        new ArticleRoute(),
        new UpvoteRoute(),
        new DownvoteRoute(),
      ],
      prefix,
    );
  }
}
