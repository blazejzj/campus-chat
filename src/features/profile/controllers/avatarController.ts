import { jsonResult } from "@/app/utils/responseJson";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import type { RequestInfo } from "rwsdk/worker";
import { Errors } from "@/app/types/errors";
import profileService from "../service/profileService";
import { User } from "../../../../types/User";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export const createAvatarController = (service: typeof profileService) => {
    return {
        async uploadAvatar(ctx: RequestInfo): Promise<Response> {
            const method = ctx.request.method.toUpperCase();
            const user = ctx.ctx.user as User | null;

            if (!user) {
                return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
            }

            if (method !== "POST") {
                return methodNotAllowed(["POST"]);
            }

            try {
                const formData = await ctx.request.formData();
                const file = formData.get("avatar") as File | null;

                if (!file) {
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "No file uploaded",
                        400
                    );
                }

                if (!ALLOWED_TYPES.includes(file.type)) {
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "Invalid file type",
                        400
                    );
                }

                if (file.size > MAX_SIZE) {
                    return errorResponse(
                        Errors.VALIDATION_ERROR,
                        "File is too large",
                        400
                    );
                }

                // TODO: Later we can upload to R2 to get real urls, right now
                // we fake it till we make it
                const timestamp = Date.now();
                const extension = file.name.split(".").pop() ?? "png";
                const avatarUrl = `/avatars/avatar_${user.id}_${timestamp}.${extension}`;

                const result = await service.updateAvatarForUser(
                    user,
                    avatarUrl
                );

                if (!result.ok) {
                    if (result.reason === Errors.DATABASE_ERROR) {
                        return errorResponse(
                            Errors.DATABASE_ERROR,
                            "Database error while updating avatar",
                            500
                        );
                    }

                    return errorResponse(
                        Errors.INTERNAL_SERVER_ERROR,
                        result.message ?? "Failed to update avatar",
                        500
                    );
                }

                return jsonResult(
                    {
                        ok: true as const,
                        data: { avatarUrl: result.data.avatarUrl },
                    },
                    200
                );
            } catch (error) {
                console.error("Error uploading avatar:", error);
                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Failed to upload avatar",
                    500
                );
            }
        },
    };
};

export const avatarController = createAvatarController(profileService);

export default avatarController;
