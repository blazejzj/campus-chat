import "dotenv/config";
import { env } from "cloudflare:workers";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/d1";

const db = drizzle(env.DB, { schema });

export default db;
