import { json } from "@/app/utils/responseJson";
import { LoginDto } from "../dto";
import { loginUser } from "../services/userService";
import { serialize } from "cookie";

export async function loginController(req: Request): Promise<Response> {
    // validate login inpputs first
    const parse = LoginDto.safeParse(await req.json());
    if (!parse.success) {
        return json({ error: "ValidationError", details: parse.error });
    }

    const result = await loginUser(parse.data);

    if (!result.ok) {
        if (result.reason === "WRONG_CREDENTIALS") {
            return json({ error: "Email or password is incorrect" });
        }
        return json({ error: "Logging in failed" }, 500);
    }

    // we need to set the cookie (HTTPONLY)
    const cookie = serialize("auth", result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return json({ user: result.user }, 200, { "Set-Cookie": cookie });
}
