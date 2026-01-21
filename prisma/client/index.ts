import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "prisma/config";
import ws from "ws";
import { PrismaClient } from "@/prisma/generated/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: env("DB_URL") });
export const db = new PrismaClient({ adapter });
