import { RequestInfo } from "rwsdk/worker";
import { Errors } from "@/app/types/errors";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { jsonResult } from "@/app/utils/responseJson";
import { z } from "zod";
import { renderRealtimeClients } from "rwsdk/realtime/worker";
import { env } from "cloudflare:workers";
import { links } from "@/app/links";
import dmChatService from "../service/dmChatService";

const SendDmMessageDto = z.object({
    body: z.string().min(1).max(2000),
});

export const createDmChatController = (service: typeof dmChatService) => ({
    async messages(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        const friendIdParam = ctx.params?.friendId;
        const friendId = friendIdParam ? Number(friendIdParam) : NaN;

        if (!friendId || Number.isNaN(friendId)) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid friend id",
                400
            );
        }

        const user = ctx.ctx?.user as { id: number; email: string } | undefined;

        if (!user) {
            return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
        }

        if (method === "GET") {
            const result = await service.getMessagesWithFriend(
                user.id,
                friendId,
                50
            );

            if (!result.ok) {
                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while fetching dm messages"
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Failed to fetch dm messages"
                );
            }

            return jsonResult(result, 200, { Allow: "GET, POST" });
        }

        if (method === "POST") {
            const body = await ctx.request.json().catch(() => null);
            const parsed = SendDmMessageDto.safeParse(body);

            if (!parsed.success) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid request body"
                );
            }

            const result = await service.sendMessageToFriend({
                currentUserId: user.id,
                friendId,
                body: parsed.data.body,
            });

            if (!result.ok) {
                if (result.reason === Errors.VALIDATION_ERROR) {
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "Invalid message"
                    );
                }

                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while sending dm message"
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Failed to send dm message"
                );
            }

            // realtime re-render for everyone on dashboard now
            await renderRealtimeClients({
                durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
                key: links.pages.dashboard,
            });

            return jsonResult(result, 201, { Allow: "GET, POST" });
        }

        return methodNotAllowed(["GET", "POST"]);
    },
});

export const dmChatController = createDmChatController(dmChatService);
export default dmChatController;
