import { notificationService } from "./../../notifications/services/notificationService";
import { AsyncResult } from "@/app/types/result";
import friendsRepository, {
    FriendListItem,
    FriendshipRow,
} from "../repository/friendsRepository";
import { Errors } from "@/app/types/errors";
import { profiles, users } from "@/server/db/userSchema";
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
    ): AsyncResult<null> {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
            return { ok: false, reason: Errors.VALIDATION_ERROR };
        }

        // this is probably illeagl and should be removed to repo, but we justs want to check if there even is a user like this
        // TODO: Consider moving
        const otherRows = await db
            .select()
            .from(users)
            .where(eq(users.email, trimmed));

        const other = otherRows[0];
        if (!other) {
            return {
                ok: false,
                reason: Errors.USER_NOT_FOUND,
            };
        }

        if (other.id === currentUserId) {
            return { ok: false, reason: Errors.VALIDATION_ERROR };
        }

        const alreadyFriends = await repo.listFriendsForUser(currentUserId);
        if (
            alreadyFriends.ok &&
            alreadyFriends.data.some((f) => f.userId === other.id)
        ) {
            return { ok: false, reason: Errors.VALIDATION_ERROR };
        }

        const [senderRow] = await db
            .select({
                id: users.id,
                email: users.email,
                displayName: profiles.displayName,
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .where(eq(users.id, currentUserId));

        if (!senderRow) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const notifResult =
            // calling notfictation service directly here, unsure if theres any other better way
            await notificationService.createFriendRequestNotification({
                toUserId: other.id,
                fromUserId: senderRow.id,
                fromEmail: senderRow.email,
                fromDisplayName: senderRow.displayName ?? null,
            });

        if (!notifResult.ok) {
            return { ok: false, reason: notifResult.reason };
        }

        return { ok: true, data: null };
    },

    async acceptFriendRequest(
        currentUserId: number,
        fromUserId: number,
        notificationId: number
    ): AsyncResult<FriendshipRow> {
        const friendship = await repo.createFriendship(
            currentUserId,
            fromUserId
        );
        if (!friendship.ok) return friendship;

        await notificationService.markAsRead(notificationId);

        return friendship;
    },

    async declineFriendRequest(
        currentUserId: number,
        fromUserId: number,
        notificationId: number
    ): AsyncResult<null> {
        await notificationService.markAsRead(notificationId);
        return { ok: true, data: null };
    },
});

export const friendsService = createFriendsService(friendsRepository);

export default friendsService;
