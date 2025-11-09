import { z } from "zod";

export const RoomCreateDto = z.object({
    name: z.string()
        .min(3, { message: "Room name must be at least 3 characters." })
        .max(50, { message: "Room name cannot exceed 50 characters." })
        .trim(),
    
  visibility: z.enum(["public", "private"]).optional(),
});

export type RoomCreateInput = z.infer<typeof RoomCreateDto>;