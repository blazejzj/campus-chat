import { AsyncResult } from "@/app/types/result";
import dmChatRepository, { MessageRow } from "../repository/dmChatRepository";
import { Errors } from "@/app/types/errors";

/*
  dm is basically "one private thread per pair of users"
*/

export const createDmChatService = (repo: typeof dmChatRepository) => ({
    async ensureThread(
        currentUserId: number,
        friendId: number
    ): AsyncResult<{ threadId: number }> {
        if (currentUserId === friendId) {
            return {
                ok: false,
                reason: Errors.VALIDATION_ERROR,
            } as any;
        }

        const existing = await repo.findThreadBetweenUsers(
            currentUserId,
            friendId
        );

        if (!existing.ok) return existing;

        if (existing.data) {
            return {
                ok: true,
                data: { threadId: existing.data.id },
            };
        }

        const created = await repo.createThreadWithUsers(
            currentUserId,
            friendId
        );

        if (!created.ok) return created;

        return {
            ok: true,
            data: { threadId: created.data.id },
        };
    },

    async getMessagesWithFriend(
        currentUserId: number,
        friendId: number,
        limit = 50
    ): AsyncResult<MessageRow[]> {
        const threadResult = await this.ensureThread(currentUserId, friendId);
        if (!threadResult.ok) return threadResult;

        const listResult = await repo.listMessagesByThreadId(
            threadResult.data.threadId,
            limit
        );

        if (!listResult.ok) return listResult;

        const sorted = [...listResult.data].sort(
            (a, b) =>
                (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
        );

        return {
            ok: true,
            data: sorted,
        };
    },

    async sendMessageToFriend({
        currentUserId,
        friendId,
        body,
    }: {
        currentUserId: number;
        friendId: number;
        body: string;
    }): AsyncResult<MessageRow> {
        const trimmed = body.trim();
        if (!trimmed) {
            return {
                ok: false,
                reason: Errors.VALIDATION_ERROR,
            } as any;
        }

        const threadResult = await this.ensureThread(currentUserId, friendId);
        if (!threadResult.ok) return threadResult;

        return repo.createMessageInThread(
            threadResult.data.threadId,
            currentUserId,
            trimmed
        );
    },
});

export const dmChatService = createDmChatService(dmChatRepository);
export default dmChatService;
