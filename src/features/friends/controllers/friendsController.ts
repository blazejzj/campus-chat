import friendsService from "../service/friendsService";
import { RequestInfo } from "rwsdk/worker";
import { Errors } from "@/app/types/errors";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { jsonResult } from "@/app/utils/responseJson";

export const createFriendsController = (service: typeof friendsService) => ({
    async friends(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        const user = ctx.ctx.user;

        if (!user) {
            return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
        }

        if (method === "GET") {
            const result = await service.listFriends(user.id);
            if (!result.ok) {
                return errorResponse(
                    result.reason ?? Errors.INTERNAL_SERVER_ERROR,
                    "Failed to load friends"
                );
            }

            return jsonResult(result, 200, { Allow: "GET, DELETE" });
        }

        if (method === "POST") {
            let body;

            try {
                body = await ctx.request.json();
            } catch (error) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid JSON body"
                );
            }

            const email = (body as any)?.email;
            if (typeof email !== "string" || !email.trim()) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Email is required"
                );
            }

            const result = await service.addFriendByEmail(user.id, email);

            if (!result.ok) {
                if (result.reason === Errors.USER_NOT_FOUND) {
                    return errorResponse(
                        Errors.USER_NOT_FOUND,
                        "No user found with that email"
                    );
                }

                if (result.reason === Errors.VALIDATION_ERROR) {
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "Invalid friend request"
                    );
                }

                return errorResponse(
                    result.reason ?? Errors.INTERNAL_SERVER_ERROR,
                    "Failed to send friend request"
                );
            }

            return jsonResult({ ok: true, data: null }, 201, {
                Allow: "GET, POST, DELETE",
            });
        }

        if (method === "DELETE") {
            const url = new URL(ctx.request.url);
            const friendIdParam = url.searchParams.get("friendId");

            if (!friendIdParam) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Missing friendId"
                );
            }

            const friendId = Number(friendIdParam);
            if (!Number.isFinite(friendId)) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid friendId"
                );
            }

            const result = await service.removeFriend(user.id, friendId);

            if (!result.ok) {
                return errorResponse(
                    result.reason ?? Errors.INTERNAL_SERVER_ERROR,
                    "Failed to remove friend"
                );
            }

            return jsonResult({ ok: true, data: null }, 200, {
                Allow: "GET, DELETE",
            });
        }

        return methodNotAllowed(["GET", "DELETE", "POST"]);
    },

    async respondToFriendRequest(ctx: RequestInfo): Promise<Response> {
        const user = ctx.ctx.user;
        if (!user) {
            return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
        }

        if (ctx.request.method.toUpperCase() !== "POST") {
            return methodNotAllowed(["POST"]);
        }

        let body: any;
        try {
            body = await ctx.request.json();
        } catch {
            return errorResponse(Errors.VALIDATION_ERROR, "Invalid JSON body");
        }

        const { fromUserId, notificationId, action } = body ?? {};

        if (
            typeof fromUserId !== "number" ||
            typeof notificationId !== "number" ||
            (action !== "accept" && action !== "decline")
        ) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid request payload"
            );
        }

        if (action === "accept") {
            const result = await service.acceptFriendRequest(
                user.id,
                fromUserId,
                notificationId
            );
            if (!result.ok) {
                return errorResponse(
                    result.reason ?? Errors.INTERNAL_SERVER_ERROR,
                    "Failed to accept friend request"
                );
            }
            return jsonResult({ ok: true, data: result.data }, 200);
        } else {
            const result = await service.declineFriendRequest(
                user.id,
                fromUserId,
                notificationId
            );
            if (!result.ok) {
                return errorResponse(
                    result.reason ?? Errors.INTERNAL_SERVER_ERROR,
                    "Failed to decline friend request"
                );
            }
            return jsonResult({ ok: true, data: null }, 200);
        }
    },
});

export const friendsController = createFriendsController(friendsService);

export default friendsController;
