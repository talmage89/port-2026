import { Router } from "@/src/platform/routing/router";
import { FeedRoute } from "./feed";

export class FeedRouter extends Router {
  constructor(prefix: string = "") {
    super([new FeedRoute()], prefix);
  }
}
