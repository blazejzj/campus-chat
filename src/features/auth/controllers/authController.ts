import { json } from "@/app/utils/responseJson";
import { serialize } from "cookie";
import { LoginDto, RegisterDto } from "../dto";
import authService from "../services/authService";
import type { RequestInfo } from "rwsdk/worker";

const AUTH_COOKIE_NAME = "auth";

function isProd(ctx?: RequestInfo) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV) {
        return process.env.NODE_ENV === "production";
    }
    return (ctx as any)?.env?.NODE_ENV === "production";
}

function makeAuthCookie(value: string, ctx?: RequestInfo) {
    return serialize(AUTH_COOKIE_NAME, value, {
        httpOnly: true,
        secure: isProd(ctx),
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}

function clearAuthCookie(ctx?: RequestInfo) {
    return serialize(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: isProd(ctx),
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
}

export const authController = {
    async login(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "POST") {
            return json({ error: "Method Not Allowed" }, 405, {
                Allow: "POST",
            });
        }

        const parsed = LoginDto.safeParse(await ctx.request.json());
        if (!parsed.success) {
            return json(
                { error: "ValidationError", details: parsed.error },
                400
            );
        }

        const result = await authService.loginUser(parsed.data);
        if (!result.ok) {
            if (result.reason === "WRONG_CREDENTIALS") {
                return json({ error: "Email or password is incorrect" }, 401);
            }
            return json({ error: "Logging in failed" }, 500);
        }

        const cookie = makeAuthCookie(result.token!, ctx);
        return json({ user: result.user }, 200, { "Set-Cookie": cookie });
    },

    async logout(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "POST") {
            return json({ error: "Method Not Allowed" }, 405, {
                Allow: "POST",
            });
        }

        const cookie = clearAuthCookie(ctx);
        return new Response(null, {
            status: 204,
            headers: { "Set-Cookie": cookie, Allow: "POST" },
        });
    },

    async register(ctx: RequestInfo): Promise<Response> {
        const method = ctx.request.method.toUpperCase();

        if (method !== "POST") {
            return json({ error: "Method Not Allowed" }, 405, {
                Allow: "POST",
            });
        }

        const parsed = RegisterDto.safeParse(await ctx.request.json());
        if (!parsed.success) {
            return json(
                { error: "ValidationError", details: parsed.error },
                400
            );
        }

        const { email, password, displayName } = parsed.data;
        const result = await authService.registerUser({
            email,
            password,
            displayName,
        });

        if (!result.ok) {
            if (result.reason === "EMAIL_IN_USE") {
                return json({ error: "Email address already in use" }, 409);
            }
            return json({ error: "Registration failed" }, 400);
        }

        return json({ id: result.id }, 201);
    },
};
