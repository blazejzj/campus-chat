import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./userSchema";
import { messages } from "./messageSchema";

export const dmThreads = sqliteTable("dm_threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
});

export const dmThreadParticipants = sqliteTable("dm_thread_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id").references(() => dmThreads.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  joinedAt: integer("joined_at", { mode: "timestamp_ms" }),
});

export const dmThreadRelations = relations(dmThreads, ({ many }) => ({
  participants: many(dmThreadParticipants),
  messages: many(messages),
}));

export const dmThreadParticipantRelations = relations(dmThreadParticipants, ({ one }) => ({
  thread: one(dmThreads, {
    fields: [dmThreadParticipants.threadId],
    references: [dmThreads.id],
  }),
  user: one(users, {
    fields: [dmThreadParticipants.userId],
    references: [users.id],
  }),
}));
