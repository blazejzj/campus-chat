import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./userSchema";

export const friendships = sqliteTable("friendships", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userIdA: integer("user_id_a")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    userIdB: integer("user_id_b")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const friendshipRelations = relations(friendships, ({ one }) => ({
    userA: one(users, {
        fields: [friendships.userIdA],
        references: [users.id],
    }),
    userB: one(users, {
        fields: [friendships.userIdB],
        references: [users.id],
    }),
}));
