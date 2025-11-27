import { RequestInfo } from "rwsdk/worker";
import globalChatService from "../services/globalChatService";
import { Errors } from "@/app/types/errors";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { jsonResult } from "@/app/utils/responseJson";
import { SendGlobalMessageDto } from "../dto";

export const createGlobalChatController = (
    service: typeof globalChatService
) => ({
    // one endpoint GET = list messages, POST = send message
    async global(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method === "GET") {
            const result = await service.getMessages();

            if (!result.ok) {
                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while fetching messages"
                    );
                }
                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Failed to fetch global messages"
                );
            }

            return jsonResult(result, 200, {
                Allow: "GET, POST",
            });
        }

        if (method === "POST") {
            // have to be logged in - middleware will set ctx.user
            const user = ctx.ctx?.user as
                | { id: number; email: string }
                | undefined;

            if (!user) {
                return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
            }

            const parsed = SendGlobalMessageDto.safeParse(
                await ctx.request.json
            );

            if (!parsed.success) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid request body"
                );
            }

            const result = await service.sendMessage({
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
                    "Failed to send global message"
                );
            }

            return jsonResult(result, 201, {
                Allow: "GET, POST",
            });
        }

        // everything else than get and post
        return methodNotAllowed(["GET", "POST"]);
    },
});

export const globalChatController =
    createGlobalChatController(globalChatService);

export default globalChatController;
