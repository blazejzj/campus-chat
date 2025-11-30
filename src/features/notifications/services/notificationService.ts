import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import { NotificationResponse } from "../types/types";
import notificationRepository from "../repository/notificationRepository";

const safeParseJson = (value: string | null): any | null => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

export const createNotificationService = (
    repo: typeof notificationRepository
) => ({
    async listNotifications(
        externalUserId: string | number,
        options?: { type?: string; unreadOnly?: boolean }
    ): AsyncResult<NotificationResponse[]> {
        const userId =
            typeof externalUserId === "number"
                ? externalUserId
                : Number.parseInt(String(externalUserId), 10);

        if (!Number.isFinite(userId)) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const repoResult = await repo.getNotificationsForUser(userId, options);

        if (!repoResult.ok) {
            return { ok: false, reason: repoResult.reason };
        }

        const mapped: NotificationResponse[] = repoResult.data.map((n) => ({
            id: n.id ?? 0,
            type: n.type ?? "",
            payload: safeParseJson(n.payload ?? null),
            createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
            readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
        }));

        console.log(mapped);
        return { ok: true, data: mapped };
    },

    async createFriendRequestNotification(input: {
        toUserId: number;
        fromUserId: number;
        fromEmail: string;
        fromDisplayName?: string | null;
    }) {
        return repo.createNotification({
            userId: input.toUserId,
            type: "friend_request",
            payload: {
                fromUserId: input.fromUserId,
                fromEmail: input.fromEmail,
                fromDisplayName: input.fromDisplayName ?? null,
            },
        });
    },

    async markAsRead(id: number) {
        return repo.markNotificationAsRead(id);
    },
});

export const notificationService = createNotificationService(
    notificationRepository
);

export default notificationService;
