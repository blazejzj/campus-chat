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
    console.log("in profileRepository.updateProfileByUserId");
    console.log(
        "Updating profile for userId:",
        userId,
        "with updates:",
        updates
    );
    await db
        .update(profileSchema)
        .set(updates)
        .where(eq(profileSchema.userId, userId))
        .run();
}

async function createProfile(userId: number, displayName?: string) {
    console.log("in profileRepository.createProfile");
    console.log("Creating profile for userId:", userId);
    await db
        .insert(profileSchema)
        .values({
            userId,
            displayName: displayName || "",
            status: "offline",
            avatarUrl: "",
            updatedAt: new Date(),
        })
        .run();
}

export default { findProfileByUserId, updateProfileByUserId, createProfile };
