import { ProfileController } from "../controllers/profileController";

export async function profileApiV1(req: Request): Promise<Response | null> {
    const { pathname } = new URL(req.url);

    if (!pathname.startsWith("/api/v1/profile")) {
        return null;
    }

    if (req.method === "GET" && pathname === "/api/v1/profile") {
        return ProfileController(req);
    }

    return null;
}
