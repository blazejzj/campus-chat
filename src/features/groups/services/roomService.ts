import { messages } from "@/server/db/schema";
import { Errors } from "@/app/types/errors";
import { RoomCreateInput } from "../dto";
import roomRepository from "../repository/roomRepository";
import { CreateRoomResult, RoomFromRepo, RoomResponse } from "../types/types";
import { AsyncResult } from "@/app/types/result";

export type Message = typeof messages.$inferSelect;

// TODO: Move those 2 utils probably later to utils dir
const mapVisibility = (
    value: string | null
): "public" | "private" | undefined => {
    if (value === "public" || value === "private") return value;
    return undefined;
};

// safe numeric converter, probably unnecessaraily "safe"
const toNumericId = (id: string | number): number | null => {
    if (typeof id === "number") return id;
    const parsed = Number.parseInt(id, 10);
    return Number.isFinite(parsed) ? parsed : null;
};

export const createRoomService = (repo: typeof roomRepository) => ({
    async createRoom(
        input: RoomCreateInput,
        creatorExternalId: string | number
    ): Promise<CreateRoomResult & { room?: RoomResponse }> {
        const creatorInternalId = toNumericId(creatorExternalId);

        if (creatorInternalId === null)
            return { ok: false, reason: Errors.ROOM_CREATION_FAILED };

        const repoResult = await repo.createRoom({
            ...input,
            createdBy: creatorInternalId,
        });

        if (!repoResult.ok) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }

        const roomId = repoResult.data;

        const room: RoomResponse = {
            id: roomId.toString(),
            name: input.name,
            visibility: input.visibility,
            createdBy: creatorExternalId.toString(),
        };

        return {
            ok: true,
            id: room.id,
            room,
        };
    },

    async getRoomsForUser(
        externalUserId: string | number
    ): AsyncResult<RoomResponse[]> {
        const internalUserId = toNumericId(externalUserId);

        if (internalUserId === null) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const repoResult = await repo.findRoomsByUserId(internalUserId);

        if (!repoResult.ok) {
            return { ok: false, reason: repoResult.reason };
        }

        const roomsFromRepo = repoResult.data as RoomFromRepo[];

        const mapped: RoomResponse[] = roomsFromRepo.map((room) => ({
            id: room.id.toString(),
            name: room.name,
            visibility: mapVisibility(room.visibility),
            createdBy: room.createdBy?.toString() ?? null,
        }));

        return { ok: true, data: mapped };
    },

    async getRoomIfAuthorized(
        roomId: string | number,
        externalUserId: string | number
    ): AsyncResult<RoomResponse | null> {
        const internalRoomId = toNumericId(roomId);
        const internalUserId = toNumericId(externalUserId);

        if (internalRoomId === null || internalUserId === null) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const repoResult = await repo.findRoomIfAuthorized(
            internalRoomId,
            internalUserId
        );
        if (!repoResult.ok) {
            return { ok: false, reason: repoResult.reason };
        }

        const room = repoResult.data as RoomFromRepo | null;

        if (!room) {
            // note we return true here, for me this seems the most logical thing to do?
            return { ok: true, data: null };
        }

        const mapped: RoomResponse = {
            id: room.id.toString(),
            name: room.name,
            visibility: mapVisibility(room.visibility),
            createdBy: room.createdBy?.toString() ?? null,
        };

        return { ok: true, data: mapped };
    },

    async getPaginatedMessages(
        roomId: string | number,
        limit: number,
        offset: number
    ): AsyncResult<Message[]> {
        const internalRoomId = toNumericId(roomId);

        if (internalRoomId === null) {
            return { ok: false, reason: Errors.VALIDATION_ERROR };
        }

        const repoResult = await repo.getPaginatedMessages(
            internalRoomId,
            limit,
            offset
        );

        if (!repoResult.ok) {
            return { ok: false, reason: repoResult.reason };
        }

        return { ok: true, data: repoResult.data };
    },
});

export const roomService = createRoomService(roomRepository);

export default roomService;
