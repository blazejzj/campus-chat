import { jsonResult } from "@/app/utils/responseJson";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import type { RequestInfo } from "rwsdk/worker";
import { Errors } from "@/app/types/errors";
import { ProfileUpdateDto } from "../dto";
import { User } from "../../../../types/User";
import profileService from "../service/profileService";

export const createProfileController = (service: typeof profileService) => {
    return {
        async handleProfile(ctx: RequestInfo): Promise<Response> {
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
                const parsed = ProfileUpdateDto.safeParse(
                    await ctx.request.json()
                );

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
    };
};

export const profileController = createProfileController(profileService);

export default profileController;
