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
        console.log("here");
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

        const id = createResult.data;

        return { ok: true, data: { id } };
    },

    async loginUser({
        email,
        password,
    }: {
        email: string;
        password: string;
    }): AsyncResult<{
        token: string;
        user: { id: number; email: string; displayName?: string };
    }> {
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

        let displayName: string | undefined = undefined;
        const profileResult = await repo.getProfileByUserId(user.id);

        if (profileResult.ok && profileResult.data?.displayName) {
            displayName = profileResult.data.displayName;
        }
        const token = await createJwt({ id: user.id, email: user.email });

        return {
            ok: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName,
                },
            },
        };
    },
});

export const authService = createAuthService(authRepository);

export default authService;
