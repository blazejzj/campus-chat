import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import profileRepository, {
    ProfileUpdates,
} from "../repository/profileRepository";
import authRepository from "@/features/auth/repository/authRepository";
import { ProfileUpdateInput } from "../dto";

type UserForProfile = {
    id: number;
    email: string;
};

export type ProfileData = {
    email: string;
    displayName: string;
    status: string;
    avatarUrl: string;
    notificationsEnabled: boolean;
};

export const createProfileService = (repo: typeof profileRepository) => {
    // TODO: helper function, consider omving later!
    async function mapProfile(user: UserForProfile): AsyncResult<ProfileData> {
        const profileResult = await repo.findProfileByUserId(user.id);

        if (!profileResult.ok) {
            return {
                ok: false,
                reason: profileResult.reason,
                message: profileResult.message,
            };
        }

        const profile = profileResult.data;

        // we expect already auth to create a profile under register
        if (!profile) {
            return {
                ok: false,
                reason: Errors.INTERNAL_SERVER_ERROR,
                message: "Profile not found for user",
            };
        }

        return {
            ok: true,
            data: {
                email: user.email,
                displayName: profile.displayName ?? "",
                status: profile.status ?? "",
                avatarUrl: profile.avatarUrl ?? "",
                notificationsEnabled: profile.notificationsEnabled ?? true,
            },
        };
    }

    return {
        async getProfileForUser(
            user: UserForProfile
        ): AsyncResult<ProfileData> {
            return mapProfile(user);
        },

        async updateProfileForUser(
            user: UserForProfile,
            updates: ProfileUpdateInput
        ): AsyncResult<ProfileData> {
            const { email, ...profileUpdates } = updates;
            // first email update f there is any
            if (email && email !== user.email) {
                const emailResult = await authRepository.updateUserEmail(
                    user.id,
                    email
                );

                if (!emailResult.ok) {
                    return {
                        ok: false,
                        reason: emailResult.reason,
                        message:
                            emailResult.reason === Errors.EMAIL_IN_USE
                                ? "Email already in use"
                                : emailResult.message,
                    };
                }

                // make sure map gets updated mail
                user = { ...user, email };
            }

            const updateResult = await repo.updateProfileByUserId(
                user.id,
                updates
            );

            if (!updateResult.ok) {
                return {
                    ok: false,
                    reason: updateResult.reason,
                    message: updateResult.message,
                };
            }

            return mapProfile(user);
        },

        async updateAvatarForUser(
            user: UserForProfile,
            avatarUrl: string
        ): AsyncResult<ProfileData> {
            const updateResult = await repo.updateProfileByUserId(user.id, {
                avatarUrl,
            });

            if (!updateResult.ok) {
                return {
                    ok: false,
                    reason: updateResult.reason,
                    message: updateResult.message,
                };
            }

            return mapProfile(user);
        },
    };
};

export const profileService = createProfileService(profileRepository);

export default profileService;
