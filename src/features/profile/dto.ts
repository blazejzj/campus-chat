import { z } from "zod";

export const ProfileUpdateDto = z
    .object({
        displayName: z.string().min(1).max(100).optional(),
        status: z.string().max(255).optional(),
        avatarUrl: z.url().max(2048).optional(),
        notificationsEnabled: z.boolean().optional(),
        email: z.email().max(255).optional(),
        currentPassword: z.string().min(6).max(255).optional(),
    })
    .refine(
        (data) =>
            Object.entries(data).some(
                ([key, value]) =>
                    key !== "currentPassword" && value !== undefined
            ),
        "Atleast one field must be provided"
    );

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateDto>;
