import { jsonResult } from "@/app/utils/responseJson";
import { serialize } from "cookie";
import { LoginDto, RegisterDto } from "../dto";
import authService from "../services/authService";
import type { RequestInfo } from "rwsdk/worker";
import { isProd } from "@/app/utils/isProd";
import { errorResponse, methodNotAllowed } from "@/app/utils/errorHandler";
import { Errors } from "../../../app/types/errors";

const AUTH_COOKIE_NAME = "auth";

function makeAuthCookie(value: string) {
    return serialize(AUTH_COOKIE_NAME, value, {
        httpOnly: true,
        secure: isProd(),
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

function clearAuthCookie() {
    return serialize(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: isProd(),
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
}

export const createAuthController = (service: typeof authService) => {
    return {
        async login(ctx: RequestInfo): Promise<Response> {
            const method = ctx.request.method.toUpperCase();

            if (method !== "POST") {
                return methodNotAllowed(["POST"]);
            }

            const parsed = LoginDto.safeParse(await ctx.request.json());
            if (!parsed.success) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid request body"
                );
            }

            const result = await service.loginUser(parsed.data);

            if (!result.ok) {
                if (result.reason === Errors.WRONG_CREDENTIALS) {
                    return errorResponse(
                        Errors.WRONG_CREDENTIALS,
                        "Email or password is incorrect"
                    );
                }

                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while logging in"
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Logging in failed"
                );
            }

            const { token } = result.data;
            const cookie = makeAuthCookie(token);

            return jsonResult(result, 200, { "Set-Cookie": cookie });
        },

        async logout(ctx: RequestInfo): Promise<Response> {
            const method = ctx.request.method.toUpperCase();

            if (method !== "POST") {
                return methodNotAllowed(["POST"]);
            }

            const cookie = clearAuthCookie();
            return new Response(null, {
                status: 204,
                headers: { "Set-Cookie": cookie, Allow: "POST" },
            });
        },

        async register(ctx: RequestInfo): Promise<Response> {
            const method = ctx.request.method.toUpperCase();

            if (method !== "POST") {
                return methodNotAllowed(["POST"]);
            }

            const parsed = RegisterDto.safeParse(await ctx.request.json());
            if (!parsed.success) {
                return errorResponse(
                    Errors.VALIDATION_ERROR,
                    "Invalid request body"
                );
            }

            const { email, password, displayName } = parsed.data;
            const result = await service.registerUser({
                email,
                password,
                displayName,
            });

            if (!result.ok) {
                if (result.reason === Errors.EMAIL_IN_USE) {
                    return errorResponse(
                        Errors.EMAIL_IN_USE,
                        "Email address already in use"
                    );
                }

                if (result.reason === Errors.DATABASE_ERROR) {
                    return errorResponse(
                        Errors.DATABASE_ERROR,
                        "Database error while registering user"
                    );
                }

                return errorResponse(
                    Errors.INTERNAL_SERVER_ERROR,
                    "Registration failed"
                );
            }

            return jsonResult(result, 201);
        },
    };
};

export const authController = createAuthController(authService);
