import { RequestInfo } from "rwsdk/worker";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { jsonResult } from "@/app/utils/responseJson";
import { User } from "../../../../types/User";
import { Errors } from "@/app/types/errors";
import notificationService from "../services/notificationService";

export const createNotificationController = (
    service: typeof notificationService
) => ({
    async listNotifications(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        if (method !== "GET") return methodNotAllowed(["GET"]);

        const user = ctx.ctx.user as User | null;
        if (!user) {
            return errorResponse(
                Errors.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        const url = new URL(ctx.request.url);
        const type = url.searchParams.get("type") || undefined;
        const unread = url.searchParams.get("unread");
        const unreadOnly = unread === "true";

        const result = await service.listNotifications(user.id, {
            type,
            unreadOnly,
        });

        if (!result.ok) {
            if (result.reason === Errors.UNAUTHORIZED) {
                return errorResponse(
                    Errors.UNAUTHORIZED,
                    "User must be authenticated"
                );
            }

            if (result.reason === Errors.DATABASE_ERROR) {
                return errorResponse(
                    Errors.DATABASE_ERROR,
                    "Failed to load notifications"
                );
            }

            return errorResponse(
                Errors.INTERNAL_SERVER_ERROR,
                "Failed to load notifications"
            );
        }

        return jsonResult(result, 200);
    },
});

export const notificationController =
    createNotificationController(notificationService);

export default notificationController;
