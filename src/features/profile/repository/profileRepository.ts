import { Errors } from "@/app/types/errors";
import { AsyncResult } from "@/app/types/result";
import db from "@/server/db";
import { profiles } from "@/server/db/userSchema";
import { eq } from "drizzle-orm";

type ProfileRow = typeof profiles.$inferSelect;

export type ProfileUpdates = {
    displayName?: string;
    status?: string;
    avatarUrl?: string;
    notificationsEnabled?: boolean;
};

export const createProfileRepository = (dbInstance: typeof db) => ({
    async findProfileByUserId(userId: number): AsyncResult<ProfileRow | null> {
        try {
            const [profile] = await dbInstance
                .select()
                .from(profiles)
                .where(eq(profiles.userId, userId))
                .limit(1);

            return {
                ok: true,
                data: profile ?? null,
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },

    async updateProfileByUserId(
        userId: number,
        updates: ProfileUpdates
    ): AsyncResult<void> {
        try {
            await dbInstance
                .update(profiles)
                .set({
                    ...updates,
                    updatedAt: new Date(),
                })
                .where(eq(profiles.userId, userId));

            return {
                ok: true,
                data: undefined, // we probably wont return anything here under updates
            };
        } catch (error) {
            return {
                ok: false,
                reason: Errors.DATABASE_ERROR,
            };
        }
    },
});

export const profileRepository = createProfileRepository(db);

export default profileRepository;
