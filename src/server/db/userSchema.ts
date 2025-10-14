import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// User table, which for now is basic, probably we can add more fields if needed
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(), // note that we make every email unique, duh
    password: text("password").notNull(),
    createdAt: integer("createdAt"),
});
