import { Router } from "~/platform/routing/router";
import { GenerateDailyRoute } from "./generate-daily";

export class AdminRouter extends Router {
  constructor(prefix: string = "") {
    super([new GenerateDailyRoute()], prefix);
  }
}
