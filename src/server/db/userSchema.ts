import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { roomMemberships } from "./roomSchema";
import { dmThreadParticipants } from "./dmSchema";
import { messages } from "./messageSchema";
import { notifications } from "./notificationSchema";
import { fileObjects } from "./fileSchema";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
});

export const profiles = sqliteTable("profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    status: text("status"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const userRelations = relations(users, ({ one, many }) => ({
    //1-1, user extra info
    profile: one(profiles),
    //1-many, user joins many rooms
    memberships: many(roomMemberships),
    //1-many, user takes part in many DM threads
    dmParticipants: many(dmThreadParticipants),
    //1-many, user sends many messages
    messages: many(messages),
    //1-many, user receives many notifications
    notifications: many(notifications),
    //1-many, user uploads many files
    files: many(fileObjects),
}));

export const profileRelations = relations(profiles, ({ one }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
    }),
}));
