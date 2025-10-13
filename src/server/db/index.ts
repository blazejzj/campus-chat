import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "cloudflare:workers";
import * as schema from "./schema";

const db = drizzle(env.DB, { schema });

export default db;
