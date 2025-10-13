import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../repository/userRepository";

export async function registerController(req: Request): Promise<Response> {
    const body = (await req.json()) as { email: string; password: string };
    const email = body.email;
    const password = body.password;

    // validate that fields are not empty
    if (!email || !password) {
        return new Response(JSON.stringify({ error: "Fields missing" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // check password length
    if (password.length < 8) {
        return new Response(JSON.stringify({ error: "Password too short" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // check if user already exists with this email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return new Response(
            JSON.stringify({ error: "Email address already in use" }),
            {
                status: 409,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    // create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(email, hashedPassword);

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
