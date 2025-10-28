import { json } from "@/app/utils/responseJson";
import { serialize } from "cookie";

export async function logoutController(req: Request): Promise<Response> {
    const clear = serialize("auth", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });

    return json({}, 200, {
        "Set-Cookie": clear,
    });
}
