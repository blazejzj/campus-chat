import bcrypt from "bcryptjs";
import authRepository from "../repository/authRepository";
import { hashPassword } from "../utils/hash";
import { LoginResult } from "../types/types";
import { createJwt } from "../utils/jwt";

export const authService = {
    async registerUser({
        email,
        password,
        displayName,
    }: {
        email: string;
        password: string;
        displayName: string;
    }) {
        const userExists = await authRepository.findUserByEmail(email);
        if (userExists) return { ok: false, reason: "EMAIL_IN_USE" as const };

        const hashedPassword = await hashPassword(password);
        const id = await authRepository.createUser(
            email,
            hashedPassword,
            displayName
        );

        return { ok: true as const, id };
    },

    async loginUser({
        email,
        password,
    }: {
        email: string;
        password: string;
    }): Promise<LoginResult> {
        const user = await authRepository.findUserByEmail(email);
        if (!user) return { ok: false, reason: "WRONG_CREDENTIALS" };

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return { ok: false, reason: "WRONG_CREDENTIALS" };

        const token = await createJwt({ id: user.id, email: user.email });

        return { ok: true, token, user: { id: user.id, email: user.email } };
    },
};

export default authService;
