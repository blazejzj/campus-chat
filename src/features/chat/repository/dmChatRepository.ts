import db from "@/server/db";
import {
    messages,
    dmThreads,
    dmThreadParticipants,
    users,
    profiles,
} from "@/server/db/schema";
import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import { and, desc, eq, inArray } from "drizzle-orm";

export type DmThreadRow = typeof dmThreads.$inferSelect;
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
export const createDmChatRepository = (dbInstance: typeof db) => ({
    async findThreadBetweenUsers(
        userIdA: number,
        userIdB: number
    ): AsyncResult<DmThreadRow | null> {
        try {
            const participantRows = await dbInstance
                .select()
                .from(dmThreadParticipants)
                .where(
                    inArray(dmThreadParticipants.userId, [userIdA, userIdB])
                );

            const countsByThreadId = new Map<number, number>();

            for (const row of participantRows) {
                const threadId = row.threadId;
                if (!threadId) continue;

                const currentCount = countsByThreadId.get(threadId) ?? 0;
                countsByThreadId.set(threadId, currentCount + 1);
            }

            let threadIdWithBothUsers: number | null = null;

            for (const [threadId, count] of countsByThreadId) {
                if (count === 2) {
                    threadIdWithBothUsers = threadId;
                    break;
                }
            }

            if (threadIdWithBothUsers === null) {
                return {
                    ok: true,
                    data: null,
                };
            }

            const rows = await dbInstance
                .select()
                .from(dmThreads)
                .where(eq(dmThreads.id, threadIdWithBothUsers));

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

    async createThreadWithUsers(
        userIdA: number,
        userIdB: number
    ): AsyncResult<DmThreadRow> {
        try {
            const now = new Date();

            const [thread] = await dbInstance
                .insert(dmThreads)
                .values({ createdAt: now })
                .returning();

            await dbInstance.insert(dmThreadParticipants).values([
                {
                    threadId: thread.id,
                    userId: userIdA,
                    joinedAt: now,
                },
                {
                    threadId: thread.id,
                    userId: userIdB,
                    joinedAt: now,
                },
            ]);

            return {
                ok: true,
                data: thread,
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },

    async listMessagesByThreadId(
        threadId: number,
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
                .where(eq(messages.threadId, threadId))
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

    async createMessageInThread(
        threadId: number,
        authorId: number,
        body: string
    ): AsyncResult<MessageRow> {
        try {
            const now = new Date();

            const inserted = await dbInstance
                .insert(messages)
                .values({
                    roomId: null,
                    threadId,
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

export const dmChatRepository = createDmChatRepository(db);
export default dmChatRepository;
