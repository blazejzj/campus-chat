import db from "@/server/db";
import { users } from "@/server/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function findUserByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ?? null;
}

export async function createUser(email: string, password: string) {
    await db.insert(users).values({ email, password }); // We expect a hashesd password, duh.
}
