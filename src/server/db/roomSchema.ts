import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./userSchema";
import { messages } from "./messageSchema";
import { fileObjects } from "./fileSchema";

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  visibility: text("visibility"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
});

export const roomMemberships = sqliteTable("room_memberships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role"),
  joinedAt: integer("joined_at", { mode: "timestamp_ms" }),
});

export const roomRelations = relations(rooms, ({ one, many }) => ({
  //1-many, room has many memberships
  memberships: many(roomMemberships),
  //1-many, room has many messages
  messages: many(messages),
  //1-many, room has many files
  files: many(fileObjects),
  
  }),);

export const roomMembershipRelations = relations(roomMemberships, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMemberships.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomMemberships.userId],
    references: [users.id],
  }),
}));
