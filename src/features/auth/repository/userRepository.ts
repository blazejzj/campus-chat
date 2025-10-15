import db from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ?? null;
}

export async function createUser(email: string, password: string) {
    try {
        const res = await db
            .insert(users)
            .values({ email, password })
            .returning({ id: users.id });
        return res[0].id; // return users id for easy use
    } catch (error: any) {
        console.error("Database error while creating an user", error); // TODO: Better error here
        throw new Error("DATABASE_ERROR");
    }
}
