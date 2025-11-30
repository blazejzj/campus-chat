import { z } from "zod";

export const RoomCreateDto = z.object({
    name: z
        .string()
        .min(3, { message: "Room name must be at least 3 characters." })
        .max(50, { message: "Room name can't exceed 50 characters." })
        .trim(),
});

export type RoomCreateInput = z.infer<typeof RoomCreateDto>;

export const RoomInviteDto = z.object({
    email: z.email({ message: "Invaldi email address" }).trim(),
});

export type RoomInviteInput = z.infer<typeof RoomInviteDto>;

export const RoomInviteDecisionDto = z.object({
    notificationId: z.number(),
});

export type RoomInviteDecisionInput = z.infer<typeof RoomInviteDecisionDto>;
