import { jsonResult } from "@/app/utils/responseJson";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import type { RequestInfo } from "rwsdk/worker";
import { Errors } from "@/app/types/errors";
import { ProfileUpdateDto } from "../dto";
import profileService from "../service/profileService";
import { User } from "../../../../types/User";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export const createProfileController = (service: typeof profileService) => ({
    // route -> /api/v1/profile  (GET, PATCH)
    async profile(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();
        const user = ctx.ctx.user as User | null;

        if (!user) {
            return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
        }

        if (method === "GET") {
            const result = await service.getProfileForUser(user);
            if (!result.ok) {
                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while loading profile",
                        500
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    result.message ?? "Failed to load profile",
                    500
                );
            }

            return jsonResult(result, 200);
        }

        if (method === "PATCH") {
            const parsed = ProfileUpdateDto.safeParse(await ctx.request.json());
            if (!parsed.success) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid request body"
                );
            }

            const result = await service.updateProfileForUser(
                user,
                parsed.data
            );

            if (!result.ok) {
                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while updating profile",
                        500
                    );
                }

                if (result.reason === Errors.EMAIL_IN_USE) {
                    return errorResponse(
                        Errors.EMAIL_IN_USE,
                        "Email address already in use",
                        400
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    result.message ?? "Failed to update profile",
                    500
                );
            }

            return jsonResult(result, 200);
        }

        return methodNotAllowed(["GET", "PATCH"]);
    },

    // route -> /api/v1/profile/avatar (POST)
    async avatar(ctx: RequestInfo): Promise<Response> {
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

            // TODO: real R2 later
            const timestamp = Date.now();
            const extension = file.name.split(".").pop() ?? "png";
            const avatarUrl = `/avatars/avatar_${user.id}_${timestamp}.${extension}`;

            const result = await service.updateAvatarForUser(user, avatarUrl);

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
});

export const profileController = createProfileController(profileService);
export default profileController;
