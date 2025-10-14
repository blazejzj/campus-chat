import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../repository/userRepository";
import { hashPassword } from "../utils/hash";
import { LoginResult } from "../types/types";
import { createJwt } from "../utils/jwt";

export async function registerUser({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    // chekc if user exists -> return false if email is in use
    const userExists = await findUserByEmail(email);
    if (userExists) return { ok: false, reason: "EMAIL_IN_USE" };

    // hash password and return new users id for easy use
    const hashedPassword = await hashPassword(password);
    const id = await createUser(email, hashedPassword);

    return { ok: true, id };
}

export async function loginUser({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<LoginResult> {
    const user = await findUserByEmail(email);
    if (!user) return { ok: false, reason: "WRONG_CREDENTIALS" };

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return { ok: false, reason: "WRONG_CREDENTIALS" };

    const token = await createJwt({ id: user.id, email: user.email });

    return { ok: true, token, user: { id: user.id, email: user.email } };
}
