import bcrypt from "bcryptjs";
import authRepository from "../repository/authRepository";
import { hashPassword } from "../utils/hash";
import { createJwt } from "../utils/jwt";
import { Errors } from "../../../app/types/errors";
import { AsyncResult } from "@/app/types/result";

export const createAuthService = (repo: typeof authRepository) => ({
    async registerUser({
        email,
        password,
        displayName,
    }: {
        email: string;
        password: string;
        displayName: string;
    }): AsyncResult<{ id: number }> {
        const userResult = await repo.findUserByEmail(email);

        if (!userResult.ok) {
            return { ok: false, reason: userResult.reason };
        }

        if (userResult.data) {
            return { ok: false, reason: Errors.EMAIL_IN_USE };
        }

        const hashedPassword = await hashPassword(password);

        const createResult = await repo.createUser(
            email,
            hashedPassword,
            displayName
        );

        if (!createResult.ok) {
            return { ok: false, reason: createResult.reason };
        }

        return { ok: true, data: { id: createResult.data } };
    },

    async loginUser({
        email,
        password,
    }: {
        email: string;
        password: string;
    }): AsyncResult<{ token: string; user: { id: number; email: string } }> {
        const userResult = await repo.findUserByEmail(email);

        if (!userResult.ok) {
            return { ok: false, reason: userResult.reason };
        }

        const user = userResult.data;

        if (!user) {
            return { ok: false, reason: Errors.WRONG_CREDENTIALS };
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return { ok: false, reason: Errors.WRONG_CREDENTIALS };
        }

        const token = await createJwt({ id: user.id, email: user.email });

        return {
            ok: true,
            data: {
                token,
                user: { id: user.id, email: user.email },
            },
        };
    },
});

export const authService = createAuthService(authRepository);

export default authService;
