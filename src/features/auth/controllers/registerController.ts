import { RegisterDto } from "../dto";
import { registerUser } from "../services/userService";
import { json } from "../../../app/utils/responseJson";

export async function registerController(req: Request): Promise<Response> {
    // validate first
    const parse = RegisterDto.safeParse(await req.json());
    if (!parse.success)
        return json({ error: "ValidationError", details: parse.error }, 400);

    // register user, make sure email is not in use
    const result = await registerUser(parse.data);

    if (!result.ok) {
        if (result.reason === "EMAIL_IN_USE") {
            return json({ error: "Email address already in use" }, 409); // 409 i assume conflict means email in use
        }
        return json({ error: "Registration failed" }, 400); // more generic error if something else comes in
    }

    return json({ id: result.id }, 201);
}
