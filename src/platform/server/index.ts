import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "hono/bun";
import { compress } from "hono/compress";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";
import { env } from "@/src/platform/utils/env";
import { routes } from "../routing";

env();

const server = new Hono();

server.use(requestId());
server.use(logger());
server.use(trimTrailingSlash());
server.use(bodyLimit({ maxSize: 1024 * 1024 }));
server.use(secureHeaders());
server.use(compress());

server.use("/*", serveStatic({ root: "./public" }));

for (const route of routes) {
  if (!(route.method in server)) {
    throw new Error(`Invalid method: ${route.method}`);
  }
  server[route.method](route.path, route.handler.bind(route));
}

export default server;
