import z from "zod";

// TODO: Make sure people can register their password with more than only strings, current approach doesnt make sense :D
export const RegisterDto = z
    .object({
        email: z.email(),
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
