import db from "@/server/db";
import { users, profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Errors } from "../../../app/types/errors";
import { AsyncResult } from "@/app/types/result";

type UserRow = typeof users.$inferSelect;

export const createAuthRepository = (dbInstance: typeof db) => ({
    async findUserByEmail(email: string): AsyncResult<UserRow | null> {
        try {
            console.log("hereeee");
            console.log(email);
            const rows = await dbInstance
                .select()
                .from(users)
                .where(eq(users.email, email));

            return {
                ok: true,
                data: rows[0] ?? null,
            };
        } catch (error) {
            console.log(error);
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },

    async createUser(
        email: string,
        passwordHash: string,
        displayName: string
    ): AsyncResult<number> {
        try {
            const now = new Date();
            const res = await dbInstance
                .insert(users)
                .values({
                    email,
                    passwordHash,
                    createdAt: now,
                })
                .returning({ id: users.id });

            const userId = res[0].id;

            await dbInstance.insert(profiles).values({
                userId,
                displayName,
                updatedAt: now,
            });

            return {
                ok: true,
                data: userId,
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },
    async updateUserEmail(userId: number, newEmail: string): AsyncResult<void> {
        try {
            // chekcing if course first if anyone has this email
            const existing = await dbInstance
                .select()
                .from(users)
                .where(eq(users.email, newEmail))
                .limit(1);

            if (existing[0] && existing[0].id !== userId) {
                return {
                    ok: false,
                    reason: Errors.EMAIL_IN_USE,
                };
            }

            await dbInstance
                .update(users)
                .set({ email: newEmail })
                .where(eq(users.id, userId));

            return {
                ok: true,
                data: undefined,
            };
        } catch (error) {
            console.error("updateUserEmail error", error);
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },
});

export const authRepository = createAuthRepository(db);

export default authRepository;
