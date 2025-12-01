import { RequestInfo } from "rwsdk/worker";
import roomService from "../services/roomService";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { User } from "../../../../types/User";
import { Errors } from "@/app/types/errors";
import { jsonResult } from "@/app/utils/responseJson";
import { RoomCreateDto, RoomInviteDecisionDto, RoomInviteDto } from "../dto";

export const createRoomController = (service: typeof roomService) => ({
    async getRooms(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "GET") return methodNotAllowed(["GET"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const result = await service.getRoomsForUser(user.id);

        if (!result.ok) {
            if (result.reason === Errors.UNAUTHORIZED) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "User must be authenticated"
                );
            }

            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "Database error while fetching rooms"
                );
            }

            if (result.reason === Errors.INTERNAL_SERVER_ERROR) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "Failed to fetch rooms"
                );
            }
        }
        return jsonResult(result, 200);
    },

    async createRoom(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "POST") return methodNotAllowed(["POST"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        let body;
        try {
            body = await ctx.request.json();
        } catch {
            return errorResponse(Errors.VALIDATION_ERROR, "Invalid JSON Body");
        }

        const parsed = RoomCreateDto.safeParse(body);

        // probably overreduntant but hm
        if (!parsed.success) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid request body"
            );
        }

        const serviceResult = await service.createRoom(parsed.data, user.id);

        if (!serviceResult.ok) {
            if (serviceResult.reason === Errors.DATABASE_ERROR) {
                Errors.DATABASE_ERROR, "Database error whiel creating room";
            }

            if (serviceResult.reason === Errors.ROOM_CREATION_FAILED) {
                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Room creation failed"
                );
            }

            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Room creation failed"
            );
        }
        return jsonResult({ ok: true, data: serviceResult.room }, 201);
    },

    async deleteRoom(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "DELETE") return methodNotAllowed(["DELETE"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const roomIdParam = ctx.params?.roomId;

        if (!roomIdParam) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Room id parameter is required"
            );
        }

        const result = await service.deleteRoom(roomIdParam, user.id);
        if (!result.ok) {
            if (result.reason === Errors.UNAUTHORIZED) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "You are not allowed to delete this room"
                );
            }

            if (result.reason === Errors.ROOM_NOT_FOUND) {
                return errorResponse(Errors.ROOM_NOT_FOUND, "Room not found");
            }

            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.DATABASE_ERROR,
                    "Database error while deleting room"
                );
            }

            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Failed to delete room"
            );
        }

        return jsonResult({ ok: true, data: null });
    },

    async inviteUser(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "POST") return methodNotAllowed(["POST"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const roomIdParam = ctx.params.roomId ?? ctx.params.id;

        if (!roomIdParam) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Room id parameter is required"
            );
        }

        let body;
        try {
            body = await ctx.request.json();
        } catch {
            return errorResponse(Errors.VALIDATION_ERROR, "Invalid JSON Body");
        }

        const parsed = RoomInviteDto.safeParse(body);
        if (!parsed.success) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid request body"
            );
        }

        const result = await service.inviteUserByEmail(
            roomIdParam,
            user.id,
            parsed.data.email
        );

        if (!result.ok) {
            switch (result.reason) {
                case "ROOM_NOT_FOUND":
                    return errorResponse(
                        Errors.ROOM_NOT_FOUND,
                        "Room not found"
                    );
                case "NOT_OWNER":
                    return errorResponse(
                        Errors.UNAUTHORIZED,
                        "Only the room owner can invite members"
                    );
                case "USER_NOT_FOUND":
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "No user found with that email"
                    );
                case "ALREADY_MEMBER":
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "User is already a member of this room"
                    );
                case "DATABASE_ERROR":
                default:
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Could not create room invite"
                    );
            }
        }

        return jsonResult({ ok: true, data: null });
    },

    async getRoomMembers(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        if (method !== "GET") return methodNotAllowed(["GET"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const roomIdParam = ctx.params.roomId ?? ctx.params.id;

        if (!roomIdParam) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Room id parameter is required"
            );
        }

        const result = await roomService.getRoomMembers(roomIdParam, user.id);

        if (!result.ok) {
            if (result.reason === Errors.UNAUTHORIZED) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "Not allowed to view members of this room"
                );
            }

            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.DATABASE_ERROR,
                    "Failed to load room members"
                );
            }

            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Failed to load room members"
            );
        }

        return jsonResult(result, 200);
    },

    async acceptInvite(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        if (method !== "POST") return methodNotAllowed(["POST"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const roomIdParam = ctx.params.roomId ?? ctx.params.id;

        if (!roomIdParam) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Room id parameter is required"
            );
        }

        let body;
        try {
            body = await ctx.request.json();
        } catch {
            return errorResponse(Errors.VALIDATION_ERROR, "Invalid JSON Body");
        }

        const parsed = RoomInviteDecisionDto.safeParse(body);
        if (!parsed.success) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid request body"
            );
        }

        const result = await roomService.acceptInvite(
            roomIdParam,
            user.id,
            parsed.data.notificationId
        );

        if (!result.ok) {
            if (result.reason === Errors.UNAUTHORIZED) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "Not allowed to accept this invite"
                );
            }
            if (result.reason === Errors.INVITE_NOT_FOUND) {
                return errorResponse(
                    Errors.INVITE_NOT_FOUND,
                    "Invite not found"
                );
            }
            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.DATABASE_ERROR,
                    "Failed to accept invite"
                );
            }
            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Failed to accept invite"
            );
        }

        return jsonResult({ ok: true, data: null });
    },

    async declineInvite(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        if (method !== "POST") return methodNotAllowed(["POST"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const roomIdParam = ctx.params.roomId ?? ctx.params?.id;

        if (!roomIdParam) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Room id parameter is required"
            );
        }

        let body;
        try {
            body = await ctx.request.json();
        } catch {
            return errorResponse(Errors.VALIDATION_ERROR, "Invalid JSON Body");
        }

        const parsed = RoomInviteDecisionDto.safeParse(body);
        if (!parsed.success) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid request body"
            );
        }

        const result = await roomService.declineInvite(
            roomIdParam,
            user.id,
            parsed.data.notificationId
        );

        if (!result.ok) {
            if (result.reason === Errors.UNAUTHORIZED) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "Not allowed to decline this invite"
                );
            }
            if (result.reason === Errors.INVITE_NOT_FOUND) {
                return errorResponse(
                    Errors.INVITE_NOT_FOUND,
                    "Invite not found"
                );
            }
            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.DATABASE_ERROR,
                    "Failed to decline invite"
                );
            }
            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Failed to decline invite"
            );
        }

        return jsonResult({ ok: true, data: null });
    },

    async leaveRoom(ctx: RequestInfo): Promise<Response> {
        console.log("controller hit");
        const method = ctx.request.method.toUpperCase();
        if (method !== "POST") return methodNotAllowed(["POST"]);

        const user = ctx.ctx.user;
        if (!user)
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "User must be authenticated"
            );

        const roomId = ctx.params.roomId ?? ctx.params.id;
        if (!roomId)
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Room id parameter is required"
            );

        const result = await service.leaveRoom(roomId, user.id);

        if (!result.ok) {
            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.DATABASE_ERROR,
                    "Failed to leave the room"
                );
            }
            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Failed to leave the room"
            );
        }

        return jsonResult({ ok: true, data: null });
    },
});

export const roomController = createRoomController(roomService);

export default roomController;
