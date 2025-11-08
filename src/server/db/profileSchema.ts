import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const profileSchema = sqliteTable("profile", {
    id: integer("id").primaryKey(),
    userId: integer("user_id").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    status: text("status"),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});
