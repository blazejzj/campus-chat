import roomChatService from "../service/roomChatService";
import { RequestInfo } from "rwsdk/worker";
import { Errors } from "@/app/types/errors";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { jsonResult } from "@/app/utils/responseJson";
import { z } from "zod";
import { renderRealtimeClients } from "rwsdk/realtime/worker";
import { env } from "cloudflare:workers";
import { links } from "@/app/links";

const SendRoomMessageDto = z.object({
    body: z.string().min(1).max(2000),
});

export const createRoomChatController = (service: typeof roomChatService) => ({
    async messages(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        const roomIdParam = ctx.params?.roomId;
        const roomId = roomIdParam ? Number(roomIdParam) : NaN;

        if (!roomId || Number.isNaN(roomId)) {
            return errorResponse(
                Errors.VALIDATION_ERROR,
                "Invalid room id",
                400
            );
        }

        if (method === "GET") {
            const result = await service.getMessages(roomId, 50);

            if (!result.ok) {
                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while fetching room messages"
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Failed to fetch room messages"
                );
            }

            return jsonResult(result, 200, { Allow: "GET, POST" });
        }

        if (method === "POST") {
            const user = ctx.ctx?.user as
                | { id: number; email: string }
                | undefined;

            if (!user) {
                return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
            }

            const body = await ctx.request.json().catch(() => null);
            const parsed = SendRoomMessageDto.safeParse(body);

            if (!parsed.success) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid request body"
                );
            }

            const result = await service.sendMessage({
                roomId,
                authorId: user.id,
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
                        "Database error while sending message"
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Failed to send room message"
                );
            }

            // also realtime for everyone on dashboadr here
            await renderRealtimeClients({
                durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
                key: links.pages.dashboard,
            });

            return jsonResult(result, 201, { Allow: "GET, POST" });
        }

        return methodNotAllowed(["GET", "POST"]);
    },
});

export const roomChatController = createRoomChatController(roomChatService);
export default roomChatController;
