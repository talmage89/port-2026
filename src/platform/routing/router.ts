import type { Context } from "hono";

export enum Method {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

export interface Route {
  path: string;
  method: Method;
  handler: (c: Context) => Promise<Response>;
}

export class Router {
  routes: Route[] = [];
  prefix: string = "";

  constructor(routes: Route[], prefix: string = "") {
    this.prefix = this.normalizePrefix(prefix);
    this.routes = routes.map((route) => this.normalizeRoute(route));
  }

  private normalizePrefix(prefix: string) {
    const isEmpty = !prefix.length || prefix === "/";
    return isEmpty ? "" : this.normalizePath(prefix);
  }

  private normalizeRoute(route: Route): Route {
    const routePath = this.normalizePath(route.path);

    const fullRawPath = `${this.prefix}${routePath}`;

    route.path = this.normalizePath(fullRawPath);
    return route;
  }

  private normalizePath(path: string): string {
    if (!path.length) {
      return "/";
    }

    const firstNormalized = this.normalizeLeadingSlash(path);
    const middleNormalized = this.normalizeInternalSlashes(firstNormalized);
    const endNormalized = this.normalizeTrailingSlash(middleNormalized);

    return endNormalized;
  }

  private normalizeLeadingSlash(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
  }

  private normalizeInternalSlashes(path: string): string {
    return path.replace(/\/+/g, "/");
  }

  private normalizeTrailingSlash(path: string): string {
    return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  }
}
