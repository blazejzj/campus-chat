import { parse as parseCookie } from "cookie";
import { verifyJwt } from "@/features/auth/utils/jwt";
import { redirect } from "../utils/redirect";
import { RequestInfo } from "rwsdk/worker";
import { links } from "../links";
import { errorResponse } from "../utils/errorHandler";
import { Errors } from "../types/errors";

// This is a middleware to protect routes that require authentication
// it checks for a valid JWT in the cookies and redirects to login if not present
// if already logged in, it redirects away from login/register pages to dashboard
export async function authMiddleware({
    request,
    ctx,
}: RequestInfo): Promise<Response | void> {
    const url = new URL(request.url);
    const { pathname, search } = url;

    // public routes
    const isApi = pathname.startsWith("/api/");

    // TODO: change this later probably
    if (pathname.startsWith("/__realtime")) return;

    if (pathname.startsWith("/api/v1/dev")) {
        return;
    }

    // public UI routes
    const isUiPublic =
        pathname === links.pages.root ||
        pathname === links.pages.login ||
        pathname === links.pages.register;

    // public api routes
    const isApiPublic =
        pathname === links.api.auth.login ||
        pathname === links.api.auth.register;

    console.log("authMiddleware", {
        pathname,
        isApi,
        isApiPublic,
    });
    if (isApi && isApiPublic) return;

    const cookies = parseCookie(request.headers.get("cookie") ?? "");
    const token = cookies["auth"];

    // verify the token, if valid attach the user to the context
    const payload = token ? await verifyJwt(token) : null;

    // else if not valid, redirect to login
    if (!payload) {
        if (isApi) {
            return errorResponse(Errors.UNAUTHORIZED, "Unauthorized", 401);
        }

        if (isUiPublic) {
            return;
        }

        const next = encodeURIComponent(pathname + search);
        return redirect(`${links.pages.login}?next=${next}`);
    }

    // allow public routes
    if (!isApi && isUiPublic) {
        return redirect(links.pages.dashboard);
    }
    // this will have to change slighlty if we add more fields to the payload
    ctx.user = {
        id: (payload as any).id ?? (payload as any).sub,
        email: (payload as any).email,
        displayName: (payload as any).displayName,
    };
}
