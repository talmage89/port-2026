import { describe, expect, test } from "bun:test";
import type { Context } from "hono";
import { Method, type Route, Router } from "./router";

const mockHandler = async (_c: Context) => new Response("ok");

const createRoute = (path: string, method: Method = Method.GET): Route => ({
  path,
  method,
  handler: mockHandler,
});

const getRoute = (router: Router, index: number): Route => {
  const route = router.routes[index];
  if (!route) {
    throw new Error(`Route at index ${index} not found`);
  }
  return route;
};

describe("Router", () => {
  describe("prefix normalization", () => {
    test("empty string prefix becomes empty", () => {
      const router = new Router([], "");
      expect(router.prefix).toBe("");
    });

    test("single slash prefix becomes empty", () => {
      const router = new Router([], "/");
      expect(router.prefix).toBe("");
    });

    test("prefix without leading slash gets one added", () => {
      const router = new Router([], "api");
      expect(router.prefix).toBe("/api");
    });

    test("prefix with leading slash is preserved", () => {
      const router = new Router([], "/api");
      expect(router.prefix).toBe("/api");
    });

    test("prefix with trailing slash has it removed", () => {
      const router = new Router([], "/api/");
      expect(router.prefix).toBe("/api");
    });

    test("prefix without leading slash and with trailing slash is normalized", () => {
      const router = new Router([], "api/");
      expect(router.prefix).toBe("/api");
    });

    test("nested prefix paths are normalized correctly", () => {
      const router = new Router([], "/api/v1/users");
      expect(router.prefix).toBe("/api/v1/users");
    });

    test("nested prefix without leading slash gets one added", () => {
      const router = new Router([], "api/v1/users");
      expect(router.prefix).toBe("/api/v1/users");
    });

    test("nested prefix with trailing slash has it removed", () => {
      const router = new Router([], "/api/v1/users/");
      expect(router.prefix).toBe("/api/v1/users");
    });
  });

  describe("route path normalization (no prefix)", () => {
    test("root path remains root", () => {
      const router = new Router([createRoute("/")]);
      expect(getRoute(router, 0).path).toBe("/");
    });

    test("empty path becomes root", () => {
      const router = new Router([createRoute("")]);
      expect(getRoute(router, 0).path).toBe("/");
    });

    test("path without leading slash gets one added", () => {
      const router = new Router([createRoute("users")]);
      expect(getRoute(router, 0).path).toBe("/users");
    });

    test("path with leading slash is preserved", () => {
      const router = new Router([createRoute("/users")]);
      expect(getRoute(router, 0).path).toBe("/users");
    });

    test("path with trailing slash has it removed", () => {
      const router = new Router([createRoute("/users/")]);
      expect(getRoute(router, 0).path).toBe("/users");
    });

    test("path without leading slash and with trailing slash is normalized", () => {
      const router = new Router([createRoute("users/")]);
      expect(getRoute(router, 0).path).toBe("/users");
    });

    test("nested paths are normalized correctly", () => {
      const router = new Router([createRoute("/api/v1/users")]);
      expect(getRoute(router, 0).path).toBe("/api/v1/users");
    });

    test("nested path without leading slash gets one added", () => {
      const router = new Router([createRoute("api/v1/users")]);
      expect(getRoute(router, 0).path).toBe("/api/v1/users");
    });

    test("nested path with trailing slash has it removed", () => {
      const router = new Router([createRoute("/api/v1/users/")]);
      expect(getRoute(router, 0).path).toBe("/api/v1/users");
    });
  });

  describe("prefix + route path combination", () => {
    test("prefix + root path equals prefix", () => {
      const router = new Router([createRoute("/")], "/api");
      expect(getRoute(router, 0).path).toBe("/api");
    });

    test("prefix + empty path equals prefix", () => {
      const router = new Router([createRoute("")], "/api");
      expect(getRoute(router, 0).path).toBe("/api");
    });

    test("prefix + path are joined correctly", () => {
      const router = new Router([createRoute("/users")], "/api");
      expect(getRoute(router, 0).path).toBe("/api/users");
    });

    test("prefix without slash + path without slash are joined correctly", () => {
      const router = new Router([createRoute("users")], "api");
      expect(getRoute(router, 0).path).toBe("/api/users");
    });

    test("prefix with trailing slash + path with leading slash avoids double slash", () => {
      const router = new Router([createRoute("/users")], "/api/");
      expect(getRoute(router, 0).path).toBe("/api/users");
    });

    test("nested prefix + nested path are joined correctly", () => {
      const router = new Router([createRoute("/users/profile")], "/api/v1");
      expect(getRoute(router, 0).path).toBe("/api/v1/users/profile");
    });

    test("empty prefix + path equals normalized path", () => {
      const router = new Router([createRoute("/users")], "");
      expect(getRoute(router, 0).path).toBe("/users");
    });

    test("slash prefix + path equals normalized path", () => {
      const router = new Router([createRoute("/users")], "/");
      expect(getRoute(router, 0).path).toBe("/users");
    });
  });

  describe("multiple routes", () => {
    test("all routes are normalized", () => {
      const routes = [
        createRoute("/"),
        createRoute("users"),
        createRoute("/posts/"),
        createRoute("comments/replies"),
      ];
      const router = new Router(routes, "/api");

      expect(getRoute(router, 0).path).toBe("/api");
      expect(getRoute(router, 1).path).toBe("/api/users");
      expect(getRoute(router, 2).path).toBe("/api/posts");
      expect(getRoute(router, 3).path).toBe("/api/comments/replies");
    });

    test("routes preserve their order", () => {
      const routes = [createRoute("/first"), createRoute("/second"), createRoute("/third")];
      const router = new Router(routes);

      expect(getRoute(router, 0).path).toBe("/first");
      expect(getRoute(router, 1).path).toBe("/second");
      expect(getRoute(router, 2).path).toBe("/third");
    });
  });

  describe("method preservation", () => {
    test("GET method is preserved", () => {
      const router = new Router([createRoute("/users", Method.GET)]);
      expect(getRoute(router, 0).method).toBe(Method.GET);
    });

    test("POST method is preserved", () => {
      const router = new Router([createRoute("/users", Method.POST)]);
      expect(getRoute(router, 0).method).toBe(Method.POST);
    });

    test("PUT method is preserved", () => {
      const router = new Router([createRoute("/users", Method.PUT)]);
      expect(getRoute(router, 0).method).toBe(Method.PUT);
    });

    test("PATCH method is preserved", () => {
      const router = new Router([createRoute("/users", Method.PATCH)]);
      expect(getRoute(router, 0).method).toBe(Method.PATCH);
    });

    test("DELETE method is preserved", () => {
      const router = new Router([createRoute("/users", Method.DELETE)]);
      expect(getRoute(router, 0).method).toBe(Method.DELETE);
    });
  });

  describe("handler preservation", () => {
    test("handler function is preserved", () => {
      const customHandler = async (_c: Context) => new Response("custom");
      const route: Route = {
        path: "/test",
        method: Method.GET,
        handler: customHandler,
      };
      const router = new Router([route]);

      expect(getRoute(router, 0).handler).toBe(customHandler);
    });
  });

  describe("edge cases", () => {
    test("router with no routes has empty routes array", () => {
      const router = new Router([]);
      expect(router.routes).toEqual([]);
    });

    test("router with no routes and prefix still has correct prefix", () => {
      const router = new Router([], "/api");
      expect(router.prefix).toBe("/api");
      expect(router.routes).toEqual([]);
    });

    test("path with multiple trailing slashes has them removed", () => {
      const router = new Router([createRoute("/users//")]);
      expect(getRoute(router, 0).path).toBe("/users");
    });

    test("double slashes in middle of path are collapsed to single slash", () => {
      const router = new Router([createRoute("/users//profile")]);
      expect(getRoute(router, 0).path).toBe("/users/profile");
    });

    test("multiple consecutive slashes are collapsed to single slash", () => {
      const router = new Router([createRoute("/api///v1////users")]);
      expect(getRoute(router, 0).path).toBe("/api/v1/users");
    });

    test("path with only slashes becomes root", () => {
      const router = new Router([createRoute("///")]);
      expect(getRoute(router, 0).path).toBe("/");
    });
  });
});
