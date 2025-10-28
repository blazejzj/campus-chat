import db from "@/server/db";
import { users, profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ?? null;
}

export async function createUser(
    email: string,
    passwordHash: string,
    displayName: string
) {
    // Step 1 -> create user
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

        // step 2 -> make profile

        await db.insert(profiles).values({
            userId,
            displayName,
            updatedAt: now,
        });
    } catch (error: any) {
        console.error("Database error while creating an user", error); // TODO: Better error here
        throw new Error("DATABASE_ERROR");
    }
}
