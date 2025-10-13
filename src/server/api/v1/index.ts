import { authApiV1 } from "@/features/auth/api/v1";

const apiHandlers = [authApiV1];

export async function apiV1(req: Request): Promise<Response | null> {
    const { pathname } = new URL(req.url);

    // if no /api/v1 provided, answer with 404, because route("api/*") will catch everything anyways
    if (!pathname.startsWith("/api/v1/")) {
        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    // loop through each feature apHandlers
    for (const featureApi of apiHandlers) {
        const res = await featureApi(req);
        if (res) {
            return res;
        }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
    });
}
