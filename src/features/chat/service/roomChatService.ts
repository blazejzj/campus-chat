import { AsyncResult } from "@/app/types/result";
import roomChatRepository, {
    MessageRow,
} from "../repository/roomChatRepository";
import { Errors } from "@/app/types/errors";

/*
  rooms chat is going to be kinda like global chat but tied to a specific room id
*/

export const createRoomChatService = (repo: typeof roomChatRepository) => ({
    async getMessages(roomId: number, limit = 50): AsyncResult<MessageRow[]> {
        const roomResult = await repo.findRoomById(roomId);
        if (!roomResult.ok) return roomResult;

        if (!roomResult.data) {
            return {
                ok: false,
                reason: Errors.VALIDATION_ERROR,
            } as any;
        }

        const listResult = await repo.listMessagesByRoomId(roomId, limit);
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

    async sendMessage({
        roomId,
        authorId,
        body,
    }: {
        roomId: number;
        authorId: number;
        body: string;
    }): AsyncResult<MessageRow> {
        const trimmed = body.trim();
        if (!trimmed) {
            return {
                ok: false,
                reason: Errors.VALIDATION_ERROR,
            } as any;
        }

        const roomResult = await repo.findRoomById(roomId);
        if (!roomResult.ok) return roomResult;

        if (!roomResult.data) {
            return {
                ok: false,
                reason: Errors.VALIDATION_ERROR,
            } as any;
        }

        return repo.createMessageForRoom(roomId, authorId, trimmed);
    },
});

export const roomChatService = createRoomChatService(roomChatRepository);
export default roomChatService;
