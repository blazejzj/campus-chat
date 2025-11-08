import db from "@/server/db";
import { eq } from "drizzle-orm";
import { profileSchema } from "@/server/db/profileSchema";

async function findProfileByUserId(userId: number) {
    const [profile] = await db
        .select()
        .from(profileSchema)
        .where(eq(profileSchema.userId, userId))
        .limit(1);
    return profile || null;
}

async function updateProfileByUserId(
    userId: number,
    updates: { displayName?: string; status?: string; avatarUrl?: string }
) {
    await db
        .update(profileSchema)
        .set(updates)
        .where(eq(profileSchema.userId, userId))
        .run();
}

export default { findProfileByUserId, updateProfileByUserId };
