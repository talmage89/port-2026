import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "hono/bun";
import { compress } from "hono/compress";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";
import { Root } from "~/app/root";
import { envSchema } from "~/utils/env";

envSchema.parse(process.env);

const server = new Hono();

server.use(requestId());
server.use(logger());
server.use(trimTrailingSlash());
server.use(bodyLimit({ maxSize: 1024 * 1024 }));
server.use(secureHeaders());
server.use(compress());

server.use("/*", serveStatic({ root: "./public" }));
server.get("/", (c) => c.html(Root()));

export default server;
