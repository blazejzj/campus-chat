import db from "@/server/db";
import { users, profiles } from "@/server/db/userSchema";
import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import { and, eq, or } from "drizzle-orm";
import { friendships } from "@/server/db/friendsSchema";

export type FriendshipRow = typeof friendships.$inferSelect;

export type FriendListItem = {
    userId: number;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
};

export const createFriendsRepository = (dbInstance: typeof db) => ({
    async listFriendsForUser(userId: number): AsyncResult<FriendListItem[]> {
        try {
            const rows = await dbInstance
                .select({
                    friendshipId: friendships.id,
                    userIdA: friendships.userIdA,
                    userIdB: friendships.userIdB,
                    friendId: users.id,
                    email: users.email,
                    displayName: profiles.displayName,
                    avatarUrl: profiles.avatarUrl,
                })
                .from(friendships)
                .innerJoin(
                    users,
                    or(
                        and(
                            eq(friendships.userIdA, userId),
                            eq(users.id, friendships.userIdB)
                        ),
                        and(
                            eq(friendships.userIdB, userId),
                            eq(users.id, friendships.userIdA)
                        )
                    )
                )
                .leftJoin(profiles, eq(profiles.userId, users.id));

            const data: FriendListItem[] = rows.map((row) => ({
                userId: row.friendId,
                email: row.email,
                displayName: row.displayName ?? null,
                avatarUrl: row.avatarUrl ?? null,
            }));

            return { ok: true, data };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },
    async createFriendship(
        userIdA: number,
        userIdB: number
    ): AsyncResult<FriendshipRow> {
        const a = Math.min(userIdA, userIdB);
        const b = Math.max(userIdA, userIdB);

        try {
            const existing = await dbInstance
                .select()
                .from(friendships)
                .where(
                    and(eq(friendships.userIdA, a), eq(friendships.userIdB, b))
                );

            if (existing[0]) {
                return { ok: true, data: existing[0] };
            }

            const now = new Date();

            const inserted = await dbInstance
                .insert(friendships)
                .values({
                    userIdA: a,
                    userIdB: b,
                    createdAt: now,
                })
                .returning();

            return { ok: true, data: inserted[0] };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async deleteFriendshipBetween(
        userId1: number,
        userId2: number
    ): AsyncResult<null> {
        const a = Math.min(userId1, userId2);
        const b = Math.max(userId1, userId2);

        try {
            await dbInstance
                .delete(friendships)
                .where(
                    and(eq(friendships.userIdA, a), eq(friendships.userIdB, b))
                );

            return { ok: true, data: null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },
});

export const friendsRepository = createFriendsRepository(db);

export default friendsRepository;
