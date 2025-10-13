import { registerController } from "../controllers/registerController";

export async function authApiV1(req: Request): Promise<Response | null> {
    const { pathname } = new URL(req.url);

    if (!pathname.startsWith("/api/v1/auth")) {
        return null;
    }

    if (req.method === "POST" && pathname === "/api/v1/auth/register") {
        return registerController(req);
    }

    return null;
}
