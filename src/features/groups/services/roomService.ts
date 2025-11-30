import { messages } from "@/server/db/schema";
import { Errors } from "@/app/types/errors";
import { RoomCreateInput } from "../dto";
import roomRepository from "../repository/roomRepository";
import {
    CreateRoomResult,
    InviteUserResult,
    RoomFromRepo,
    RoomMemberResponse,
    RoomResponse,
} from "../types/types";
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
            visibility: "private", // again like in room repositroy look at the comment
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

    async deleteRoom(
        roomId: string | number,
        externalUserId: string | number
    ): Promise<AsyncResult<null>> {
        const internalRoomId = toNumericId(roomId);
        const internalUserId = toNumericId(externalUserId);

        if (internalRoomId === null || internalUserId === null) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const roomResult = await repo.findRoomById(internalRoomId);
        if (!roomResult.ok) {
            return { ok: false, reason: roomResult.reason };
        }

        const room = roomResult.data;
        if (!room) {
            return { ok: false, reason: Errors.ROOM_NOT_FOUND };
        }

        if (room.createdBy !== internalUserId) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const deleteResult = await repo.deleteRoom(internalRoomId);
        if (!deleteResult.ok) {
            return { ok: false, reason: deleteResult.reason };
        }

        return { ok: true, data: null };
    },

    async inviteUserByEmail(
        roomId: string | number,
        inviterExternalId: string | number,
        email: string
    ): Promise<InviteUserResult> {
        const internalRoomId = toNumericId(roomId);
        const inviterInternalId = toNumericId(inviterExternalId);

        if (internalRoomId === null || inviterInternalId === null) {
            return { ok: false, reason: "ROOM_NOT_FOUND" };
        }

        const roomResult = await repo.findRoomById(internalRoomId);
        if (!roomResult.ok) {
            return { ok: false, reason: "DATABASE_ERROR" };
        }

        const room = roomResult.data;
        if (!room) {
            return { ok: false, reason: "ROOM_NOT_FOUND" };
        }

        // only OWNER can invite people duh
        // maybe later we can extend by giving permissions or something, but thats... too muc for now
        if (room.createdBy !== inviterInternalId) {
            return { ok: false, reason: "NOT_OWNER" };
        }

        const userResult = await repo.findUserByEmail(email);
        if (!userResult.ok) {
            return { ok: false, reason: "DATABASE_ERROR" };
        }

        const targetUser = userResult.data;
        if (!targetUser) {
            return { ok: false, reason: "USER_NOT_FOUND" };
        }

        const membershipResult = await repo.isUserMemberOfRoom(
            internalRoomId,
            targetUser.id
        );
        if (!membershipResult.ok) {
            return { ok: false, reason: "DATABASE_ERROR" };
        }

        if (membershipResult.data) {
            return { ok: false, reason: "ALREADY_MEMBER" };
        }

        const inviterUserResult = await repo.findUserById(inviterInternalId);
        if (!inviterUserResult.ok) {
            return { ok: false, reason: "DATABASE_ERROR" };
        }

        const inviterEmail = inviterUserResult.data?.email ?? "Unknown user";

        const inviteResult = await repo.createRoomInviteNotification({
            userId: targetUser.id,
            roomId: internalRoomId,
            roomName: room.name,
            invitedByUserId: inviterInternalId,
            invitedByEmail: inviterEmail,
        });

        if (!inviteResult.ok) {
            return { ok: false, reason: "DATABASE_ERROR" };
        }

        return { ok: true };
    },

    async getRoomMembers(
        roomId: string | number,
        externalUserId: string | number
    ): AsyncResult<RoomMemberResponse[]> {
        const internalRoomId = toNumericId(roomId);
        const internalUserId = toNumericId(externalUserId);

        if (internalRoomId === null || internalUserId === null) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        // only members shouldb e able to see whos inside a room
        const membershipResult = await repo.isUserMemberOfRoom(
            internalRoomId,
            internalUserId
        );
        if (!membershipResult.ok) {
            return { ok: false, reason: membershipResult.reason };
        }
        if (!membershipResult.data) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const membersResult = await repo.getRoomMembers(internalRoomId);
        if (!membersResult.ok) {
            return { ok: false, reason: membersResult.reason };
        }

        const mapped: RoomMemberResponse[] = membersResult.data.map((m) => ({
            id: m.id.toString(),
            email: m.email,
            displayName: m.displayName ?? null,
        }));

        return { ok: true, data: mapped };
    },

    async acceptInvite(
        roomId: string | number,
        externalUserId: string | number,
        notificationId: number
    ): Promise<AsyncResult<null>> {
        const internalRoomId = toNumericId(roomId);
        const internalUserId = toNumericId(externalUserId);

        if (internalRoomId === null || internalUserId === null) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const notifResult = await repo.getNotificationByIdForUser(
            notificationId,
            internalUserId
        );
        if (!notifResult.ok) {
            return { ok: false, reason: notifResult.reason };
        }
        const notification = notifResult.data;
        if (!notification || notification.type !== "room_invite") {
            return { ok: false, reason: Errors.INVITE_NOT_FOUND };
        }

        let payloadRoomId: number | null = null;
        try {
            const payload = notification.payload
                ? JSON.parse(notification.payload)
                : null;
            if (payload && typeof payload.roomId === "number") {
                payloadRoomId = payload.roomId;
            }
        } catch {
            return { ok: false, reason: Errors.VALIDATION_ERROR };
        }

        if (payloadRoomId === null || payloadRoomId !== internalRoomId) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const membershipResult = await repo.isUserMemberOfRoom(
            internalRoomId,
            internalUserId
        );
        if (!membershipResult.ok) {
            return { ok: false, reason: membershipResult.reason };
        }

        if (!membershipResult.data) {
            const addResult = await repo.addRoomMember(
                internalRoomId,
                internalUserId,
                "member"
            );
            if (!addResult.ok) {
                return { ok: false, reason: addResult.reason };
            }
        }

        const markResult = await repo.markNotificationRead(notificationId);
        if (!markResult.ok) {
            return { ok: false, reason: markResult.reason };
        }

        return { ok: true, data: null };
    },

    async declineInvite(
        roomId: string | number,
        externalUserId: string | number,
        notificationId: number
    ): Promise<AsyncResult<null>> {
        const internalRoomId = toNumericId(roomId);
        const internalUserId = toNumericId(externalUserId);

        if (internalRoomId === null || internalUserId === null) {
            return { ok: false, reason: Errors.UNAUTHORIZED };
        }

        const notifResult = await repo.getNotificationByIdForUser(
            notificationId,
            internalUserId
        );
        if (!notifResult.ok) {
            return { ok: false, reason: notifResult.reason };
        }
        const notification = notifResult.data;
        if (!notification || notification.type !== "room_invite") {
            return { ok: false, reason: Errors.INVITE_NOT_FOUND };
        }

        // hm, I could potentialy check if payload.roomId is requal to internalRoomId like over
        // but i dont think its necessary for decline, hence I am not going to
        const markResult = await repo.markNotificationRead(notificationId);
        if (!markResult.ok) {
            return { ok: false, reason: markResult.reason };
        }

        return { ok: true, data: null };
    },
});

export const roomService = createRoomService(roomRepository);

export default roomService;
