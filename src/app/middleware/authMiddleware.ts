import { parse as parseCookie } from "cookie";
import { verifyJwt } from "@/features/auth/utils/jwt";
import { json } from "../utils/responseJson";
import { redirect } from "../utils/redirect";
import { RequestInfo } from "rwsdk/worker";

// This is a middleware to protect routes that require authentication
// it checks for a valid JWT in the cookies and redirects to login if not present
// if already logged in, it redirects away from login/register pages to dashboard
export async function authMiddleware({ request, ctx }: RequestInfo) {
    const url = new URL(request.url);
    const { pathname, search } = url;

    // public routes
    const isApi = pathname.startsWith("/api/");

    // public UI routes
    const isUiPublic =
        pathname === "/" || pathname === "/login" || pathname === "/register";

    // public api routes
    const isApiPublic =
        pathname === "/api/v1/auth/login" ||
        pathname === "/api/v1/auth/register";

    if (isApi && isApiPublic) return;

    const cookies = parseCookie(request.headers.get("cookie") ?? "");
    const token = cookies["auth"];

    // verify the token, if valid attach the user to the context
    const payload = token ? await verifyJwt(token) : null;

    // else if not valid, redirect to login
    if (!payload) {
        if (isApi) {
            return json({ error: "Unauthorized" }, 401);
        }

        if (isUiPublic) {
            return;
        }

        const next = encodeURIComponent(pathname + search);
        return redirect(`/login?next=${next}`);
    }

    // allow public routes
    if (!isApi && isUiPublic) {
        return redirect("/dashboard");
    }
    // this will have to change slighlty if we add more fields to the payload
    ctx.user = {
        id: (payload as any).id ?? (payload as any).sub,
        email: (payload as any).email,
    };
}
