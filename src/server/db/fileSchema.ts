import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./userSchema";
import { rooms } from "./roomSchema";
import { messages } from "./messageSchema";

export const fileObjects = sqliteTable("file_objects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uploaderId: integer("uploader_id").references(() => users.id, { onDelete: "set null" }),
  roomId: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  mime: text("mime"),
  sizeBytes: integer("size_bytes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
});

export const fileObjectRelations = relations(fileObjects, ({ one }) => ({
  uploader: one(users, {
    fields: [fileObjects.uploaderId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [fileObjects.roomId],
    references: [rooms.id],
  }),
  message: one(messages, {
    fields: [fileObjects.messageId],
    references: [messages.id],
  }),
}));
