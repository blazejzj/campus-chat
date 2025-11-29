import { z } from "zod";

export const ProfileUpdateDto = z
    .object({
        displayName: z.string().min(1).max(100).optional(),
        status: z.string().max(255).optional(),
        avatarUrl: z.string().url().max(2048).optional(),
        notificationsEnabled: z.boolean().optional(),
        email: z.string().email().max(255).optional(),
        currentPassword: z.string().min(6).max(255).optional(),
        newPassword: z.string().min(6).max(255).optional(),
        confirmNewPassword: z.string().min(6).max(255).optional(),
    })
    .refine(
        (data) =>
            Object.entries(data).some(
                ([key, value]) =>
                    !["currentPassword", "confirmNewPassword"].includes(key) &&
                    value !== undefined
            ),
        {
            message: "Atleast one field must be provided",
            path: [],
        }
    )
    .refine(
        (data) =>
            !data.newPassword || data.newPassword === data.confirmNewPassword,
        {
            message: "New passwords do not match",
            path: ["confirmNewPassword"],
        }
    );

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateDto>;
