import db from "@/server/db";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function findProfileByUserId(userId: number) {
    const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

    return profile ?? null;
}

async function updateProfileByUserId(
    userId: number,
    updates: {
        displayName?: string;
        status?: string;
        avatarUrl?: string;
        notificationsEnabled?: boolean;
    }
) {
    console.log("in profileRepository.updateProfileByUserId");
    console.log(
        "Updating profile for userId:",
        userId,
        "with updates:",
        updates
    );

    await db
        .update(profiles)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId));
}

async function createProfile(userId: number, displayName?: string) {
    console.log("in profileRepository.createProfile");
    console.log("Creating profile for userId:", userId);

    await db.insert(profiles).values({
        userId,
        displayName: displayName || "",
        avatarUrl: "",
        status: "offline",
        notificationsEnabled: true,
        updatedAt: new Date(),
    });
}

export default { findProfileByUserId, updateProfileByUserId, createProfile };
