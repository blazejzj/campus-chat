import "dotenv/config";
import { env } from "cloudflare:workers";
import * as schema from "./schema";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

export const db = drizzle(env.DB, { schema });

export type DB = DrizzleD1Database<typeof schema>;

