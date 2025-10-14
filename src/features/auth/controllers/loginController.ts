import { json } from "@/app/utils/responseJson";
import { LoginDto } from "../dto";
import { loginUser } from "../services/userService";

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

    return json({ token: result.token, user: result.user }, 200);
}
