import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// User table, which for now is basic, probably we can add more fields if needed
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(), // note that we make every email unique, duh
    password: text("password").notNull(),
    createdAt: integer("created_at")
        .notNull()
        .default(sql`(unixepoch())`), // if not mistaken, this stores time in seconds
});
