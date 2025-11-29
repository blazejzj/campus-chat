import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import profileRepository from "../repository/profileRepository";
import authRepository from "@/features/auth/repository/authRepository";
import { ProfileUpdateInput } from "../dto";
import bcrypt from "bcryptjs";

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

    async function verifyPassword(
        user: UserForProfile,
        password: string
    ): AsyncResult<void> {
        const userResult = await authRepository.findUserByEmail(user.email);

        if (!userResult.ok) {
            return {
                ok: false,
                reason: userResult.reason,
                message: "Failed to load user",
            };
        }

        const userRow = userResult.data;

        if (!userRow) {
            return {
                ok: false,
                reason: Errors.WRONG_CREDENTIALS,
                message: "Wrong password",
            };
        }

        const match = await bcrypt.compare(password, userRow.passwordHash);
        if (!match) {
            return {
                ok: false,
                reason: Errors.WRONG_CREDENTIALS,
                message: "Wrong password",
            };
        }

        return { ok: true, data: undefined };
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
            const {
                email,
                displayName,
                status,
                avatarUrl,
                notificationsEnabled,
                currentPassword,
            } = updates;

            let nextUser = user;

            const wantsEmailChange = email && email !== user.email;
            const wantsDisplayNameChange =
                typeof displayName === "string" && displayName.length > 0;

            const needsPasswordCheck =
                wantsEmailChange || wantsDisplayNameChange;

            if (needsPasswordCheck) {
                if (!currentPassword) {
                    return {
                        ok: false,
                        reason: Errors.WRONG_CREDENTIALS,
                        message: "Current password is required",
                    };
                }

                const passwordResult = await verifyPassword(
                    user,
                    currentPassword
                );
                if (!passwordResult.ok) {
                    return passwordResult;
                }
            }

            if (wantsEmailChange) {
                const emailResult = await authRepository.updateUserEmail(
                    user.id,
                    email!
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

                nextUser = { ...user, email: email! };
            }

            const profileUpdates: {
                displayName?: string;
                status?: string;
                avatarUrl?: string;
                notificationsEnabled?: boolean;
            } = {};

            if (displayName !== undefined) {
                profileUpdates.displayName = displayName;
            }
            if (status !== undefined) {
                profileUpdates.status = status;
            }
            if (avatarUrl !== undefined) {
                profileUpdates.avatarUrl = avatarUrl;
            }
            if (notificationsEnabled !== undefined) {
                profileUpdates.notificationsEnabled = notificationsEnabled;
            }

            const updateResult = await repo.updateProfileByUserId(
                nextUser.id,
                profileUpdates
            );

            if (!updateResult.ok) {
                return {
                    ok: false,
                    reason: updateResult.reason,
                    message: updateResult.message,
                };
            }

            return mapProfile(nextUser);
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
