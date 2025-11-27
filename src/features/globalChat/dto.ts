import z from "zod";

export const SendGlobalMessageDto = z.object({
    body: z.string().min(1).max(2000),
});

export type SendGlobalMessageDto = z.infer<typeof SendGlobalMessageDto>;
