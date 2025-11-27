import {
    GLOBAL_ROOM_SLUG,
    MessageRow,
    NewRoomRow,
    RoomRow,
} from "./../controllers/globalChatRepository";
import { AsyncResult } from "@/app/types/result";
import globalChatRepository from "../controllers/globalChatRepository";
import { Errors } from "@/app/types/errors";
/* 
Here we want potentially make sure that the slug = "global exists",
Get the messages from global
allow making messages in global
*/

export const createGlobalChatService = (repo: typeof globalChatRepository) => ({
    async ensureGlobalRoom(): AsyncResult<RoomRow> {
        // First step would be to find the room
        const result = await repo.findRoomBySlug(GLOBAL_ROOM_SLUG);
        if (!result.ok) {
            return result;
        }

        if (result.data) {
            return {
                ok: true,
                data: result.data,
            };
        }

        // create it if it doesnt exist
        const now = new Date();
        const newRoom: NewRoomRow = {
            name: "Global chat",
            slug: GLOBAL_ROOM_SLUG,
            visibility: "public",
            createdBy: null,
            createdAt: now,
        };

        const createResult = await repo.createRoom(newRoom);
        if (!createResult.ok) {
            return createResult;
        }

        return {
            ok: true,
            data: createResult.data,
        };
    },

    async getMessages(limit = 50): AsyncResult<MessageRow[]> {
        const roomResult = await this.ensureGlobalRoom();
        if (!roomResult.ok) {
            return roomResult;
        }

        const listResult = await repo.listMessagesByRoomId(
            roomResult.data.id,
            limit
        );

        if (!listResult.ok) {
            return listResult;
        }

        // if we want to sort it by oldest we could porentially maybe do this
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
        authorId,
        body,
    }: {
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

        const roomResult = await this.ensureGlobalRoom();
        if (!roomResult.ok) {
            return roomResult;
        }

        return repo.createMessageForRoom(roomResult.data.id, authorId, trimmed);
    },
});

export const globalChatService = createGlobalChatService(globalChatRepository);

export default globalChatService;
