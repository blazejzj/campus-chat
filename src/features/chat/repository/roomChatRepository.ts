import db from "@/server/db";
import { messages, profiles, rooms, users } from "@/server/db/schema";
import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import { desc, eq } from "drizzle-orm";

export type RoomRow = typeof rooms.$inferSelect;
export type MessageRow = {
    id: number;
    roomId: number | null;
    threadId: number | null;
    authorId: number | null;
    body: string | null;
    createdAt: Date | null;
    editedAt: Date | null;
    deletedAt: Date | null;
    authorDisplayName: string | null;
    authorAvatarUrl: string | null;
    authorEmail: string | null;
};

export const createRoomChatRepository = (dbInstance: typeof db) => ({
    async findRoomById(roomId: number): AsyncResult<RoomRow | null> {
        try {
            const rows = await dbInstance
                .select()
                .from(rooms)
                .where(eq(rooms.id, roomId));

            return {
                ok: true,
                data: rows[0] ?? null,
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },
    async listMessagesByRoomId(
        roomId: number,
        limit: number
    ): AsyncResult<MessageRow[]> {
        try {
            const rows = await dbInstance
                .select({
                    id: messages.id,
                    roomId: messages.roomId,
                    threadId: messages.threadId,
                    authorId: messages.authorId,
                    body: messages.body,
                    createdAt: messages.createdAt,
                    editedAt: messages.editedAt,
                    deletedAt: messages.deletedAt,
                    authorDisplayName: profiles.displayName,
                    authorAvatarUrl: profiles.avatarUrl,
                    authorEmail: users.email,
                })
                .from(messages)
                .leftJoin(users, eq(messages.authorId, users.id))
                .leftJoin(profiles, eq(users.id, profiles.userId))
                .where(eq(messages.roomId, roomId))
                .orderBy(desc(messages.createdAt))
                .limit(limit);

            return {
                ok: true,
                data: rows,
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },

    async createMessageForRoom(
        roomId: number,
        authorId: number,
        body: string
    ): AsyncResult<MessageRow> {
        try {
            const now = new Date();

            const inserted = await dbInstance
                .insert(messages)
                .values({
                    roomId,
                    threadId: null,
                    authorId,
                    body,
                    createdAt: now,
                    editedAt: null,
                    deletedAt: null,
                })
                .returning({
                    id: messages.id,
                });

            const messageId = inserted[0]?.id;
            if (!messageId) {
                return {
                    ok: false,
                    reason: Errors.DATABASE_ERROR,
                };
            }

            const [row] = await dbInstance
                .select({
                    id: messages.id,
                    roomId: messages.roomId,
                    threadId: messages.threadId,
                    authorId: messages.authorId,
                    body: messages.body,
                    createdAt: messages.createdAt,
                    editedAt: messages.editedAt,
                    deletedAt: messages.deletedAt,
                    authorDisplayName: profiles.displayName,
                    authorAvatarUrl: profiles.avatarUrl,
                    authorEmail: users.email,
                })
                .from(messages)
                .leftJoin(users, eq(messages.authorId, users.id))
                .leftJoin(profiles, eq(users.id, profiles.userId))
                .where(eq(messages.id, messageId));

            if (!row) {
                return {
                    ok: false,
                    reason: Errors.DATABASE_ERROR,
                };
            }

            return {
                ok: true,
                data: row,
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },
});

export const roomChatRepository = createRoomChatRepository(db);

export default roomChatRepository;
