import { json } from "@/app/utils/responseJson";
import { authApiV1 } from "@/features/auth/api/v1";

const apiHandlers = {
    auth: authApiV1,
    // add more feature api handlers here
};

export async function apiV1(req: Request): Promise<Response | null> {
    const { pathname } = new URL(req.url);

    // if no /api/v1 provided, answer with 404, because route("api/*") will catch everything anyways
    if (!pathname.startsWith("/api/v1/")) {
        return json({ error: "Not found" }, 404);
    }

    const pathParts = pathname.slice("/api/v1/".length).split("/");
    const feature = pathParts[0];

    const handler = apiHandlers[feature as keyof typeof apiHandlers];
    if (handler) {
        return handler(req);
    }

    return json({ error: "Not found" }, 404);
}
