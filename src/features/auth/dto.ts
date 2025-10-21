import z from "zod";

// TODO: Make sure people can register their password with more than only strings, current approach doesnt make sense :D
export const RegisterDto = z
    .object({
        email: z.email(),
        displayName: z
            .string()
            .trim()
            .min(2, "Display name must be at least 2 characters")
            .max(32, "Display name must be at most 32 characters"),
        password: z
            .string()
            .min(8, "Password must be atleast 8 characters long"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const LoginDto = z.object({
    email: z.email(),
    password: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
