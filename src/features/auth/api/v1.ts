import { loginController } from "../controllers/loginController";
import { registerController } from "../controllers/registerController";
import { logoutController } from "../controllers/logoutController";

export async function authApiV1(req: Request): Promise<Response | null> {
    const { pathname } = new URL(req.url);

    if (!pathname.startsWith("/api/v1/auth")) {
        // check, does it belong here? else null
        return null;
    }

    if (req.method === "POST" && pathname === "/api/v1/auth/register") {
        return registerController(req);
    }

    if (req.method === "POST" && pathname === "/api/v1/auth/login") {
        return loginController(req);
    }

    if (req.method === "POST" && pathname === "/api/v1/auth/logout") {
        return logoutController(req);
    }

    return null;
}
