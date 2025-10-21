import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./userSchema";
import { rooms } from "./roomSchema";
import { dmThreads } from "./dmSchema";
import { fileObjects } from "./fileSchema";

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  threadId: integer("thread_id").references(() => dmThreads.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  editedAt: integer("edited_at", { mode: "timestamp_ms" }),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const messageEdits = sqliteTable("message_edits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  oldBody: text("old_body").notNull(),
  editedAt: integer("edited_at", { mode: "timestamp_ms" }),
});

export const messageReads = sqliteTable("message_reads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  readAt: integer("read_at", { mode: "timestamp_ms" }),
});

export const messageRelations = relations(messages, ({ one, many }) => ({
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
  thread: one(dmThreads, {
    fields: [messages.threadId],
    references: [dmThreads.id],
  }),
  edits: many(messageEdits),
  reads: many(messageReads),
  files: many(fileObjects),
}));

export const messageEditRelations = relations(messageEdits, ({ one }) => ({
  message: one(messages, {
    fields: [messageEdits.messageId],
    references: [messages.id],
  }),
}));

export const messageReadRelations = relations(messageReads, ({ one }) => ({
  message: one(messages, {
    fields: [messageReads.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReads.userId],
    references: [users.id],
  }),
}));
