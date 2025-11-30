import { AsyncResult } from "@/app/types/result";
import friendsRepository, {
    FriendListItem,
    FriendshipRow,
} from "../repository/friendsRepository";
import { Errors } from "@/app/types/errors";
import { users } from "@/server/db/userSchema";
import { eq } from "drizzle-orm";
import db from "@/server/db";

export const createFriendsService = (repo: typeof friendsRepository) => ({
    async listFriends(userId: number): AsyncResult<FriendListItem[]> {
        return repo.listFriendsForUser(userId);
    },

    async removeFriend(userId: number, friendId: number): AsyncResult<null> {
        return repo.deleteFriendshipBetween(userId, friendId);
    },

    async addFriendByUserIds(userId: number, otherUserId: number) {
        if (userId === otherUserId) {
            return { ok: false, reason: Errors.VALIDATION_ERROR }; // super dumb proof but why not
        }
        return repo.createFriendship(userId, otherUserId);
    },

    async addFriendByEmail(
        currentUserId: number,
        email: string
    ): AsyncResult<FriendshipRow> {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
            return { ok: false, reason: Errors.VALIDATION_ERROR } as any;
        }

        // this is probably illeagl and should be removed to repo, but we justs want to check if there even is a user like this
        // TODO: Consider moving
        const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, trimmed));

        const other = rows[0];
        if (!other) {
            return {
                ok: false,
                reason: Errors.USER_NOT_FOUND,
            };
        }

        return repo.createFriendship(currentUserId, other.id);
    },
});

export const friendsService = createFriendsService(friendsRepository);

export default friendsService;
