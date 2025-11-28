import z from "zod";

export const ProfileUpdateDto = z
    .object({
        displayName: z.string().min(1).max(100).optional(),
        status: z.string().max(255).optional(),
        avatarUrl: z.string().max(2048).optional(),
        notificationsEnabled: z.boolean().optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        "Atleast one field must be provided"
    );

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateDto>;
