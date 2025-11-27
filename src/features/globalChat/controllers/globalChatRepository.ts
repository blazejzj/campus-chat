import { Errors } from "@/app/types/errors";
import { AsyncResult } from "@/app/types/result";
import db from "@/server/db";
import { rooms } from "@/server/db/roomSchema";
import { messages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export type RoomRow = typeof rooms.$inferSelect;
export type NewRoomRow = typeof rooms.$inferInsert;
export type MessageRow = typeof messages.$inferSelect;

export const GLOBAL_ROOM_SLUG = "global";

// TODO: Possibly move stuff so chat feature also can use this
export const createGlobalChatRepository = (dbInstance: typeof db) => ({
    async findRoomBySlug(slug: string): AsyncResult<RoomRow | null> {
        try {
            const rows = await dbInstance
                .select()
                .from(rooms)
                .where(eq(rooms.slug, slug));

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

    async createRoom(values: NewRoomRow): AsyncResult<RoomRow> {
        try {
            const res = await dbInstance
                .insert(rooms)
                .values(values)
                .returning();

            return {
                ok: true,
                data: res[0],
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
                .select()
                .from(messages)
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

            const res = await dbInstance
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
                .returning();

            return {
                ok: true,
                data: res[0],
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },
});

export const globalChatRepository = createGlobalChatRepository(db);

export default globalChatRepository;
