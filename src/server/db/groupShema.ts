import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./userSchema"; 

export const groups = sqliteTable("groups", {
    id: text("id").primaryKey(), 
    name: text("name").notNull(),
    creatorId: integer("creator_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    members: text("members").notNull().default("[]"),
    memberCount: integer("member_count").notNull().default(1), 
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$default(() => sql`(strftime('%s', 'now'))`),
});

export const groupIndexes = index("idx_groups_creator_id").on(groups.creatorId);

export type Group = typeof groups.$inferSelect;
export type CreateGroup = typeof groups.$inferInsert;
