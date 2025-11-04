import db from "@/server/db";
import { users, profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const authRepository = {
    async findUserByEmail(email: string) {
        const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return rows[0] ?? null;
    },

    async createUser(email: string, passwordHash: string, displayName: string) {
        try {
            const now = new Date();
            const res = await db
                .insert(users)
                .values({
                    email,
                    passwordHash,
                    createdAt: now,
                })
                .returning({ id: users.id });

            const userId = res[0].id;

            await db.insert(profiles).values({
                userId,
                displayName,
                updatedAt: now,
            });

            return userId;
        } catch (error: any) {
            throw new Error("DATABASE_ERROR");
        }
    },
};

export default authRepository;
