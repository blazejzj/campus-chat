import { parse as parseCookie } from "cookie";
import { verifyJwt } from "@/features/auth/utils/jwt";
import { json } from "../utils/responseJson";

// This is a middleware to protect routes that require authentication
// it checks for a valid JWT in the cookies and redirects to login if not present
export function authMiddleware() {
    return async ({ request, ctx }: { request: Request; ctx: any }) => {
        const url = new URL(request.url);
        const { pathname, search } = url;

        // public routes
        const isApi = pathname.startsWith("/api/");
        const isUiPublic = pathname === "/login" || pathname === "/register";
        const isApiPublic =
            pathname === "/api/v1/auth/login" ||
            pathname === "/api/v1/auth/register";

        // allow public routes
        if ((!isApi && isUiPublic) || (isApi && isApiPublic)) return;

        const cookies = parseCookie(request.headers.get("cookie") ?? "");
        const token = cookies["auth"];

        // verify the token, if valid attach the user to the context
        const payload = token ? await verifyJwt(token) : null;

        // else if not valid, redirect to login
        if (!payload) {
            if (isApi) {
                return json({ error: "Unauthorized" }, 401);
            }

            const next = encodeURIComponent(pathname + search);
            return json({ redirect: `/login?next=${next}` }, 302);
        }

        // this will have to change slighlty if we add more fields to the payload
        ctx.user = {
            id: (payload as any).id ?? (payload as any).sub,
            email: (payload as any).email,
        };
    };
}
