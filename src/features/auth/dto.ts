import z from "zod";

// a simple schems for password with basic regex, should work wonders
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number");

// TODO: This could potentially be scrapepd at some point, i make it
// because this will wokr with older rules where it wanst required to have atleast
// 1 special symbol and a number
const loginPasswordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long");

export const RegisterDto = z
    .object({
        email: z.email({ message: "Please enter a valid email address" }),
        displayName: z
            .string()
            .trim()
            .min(2, "Display name must be at least 2 characters")
            .max(32, "Display name must be at most 32 characters"),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const LoginDto = z.object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: loginPasswordSchema,
});

export type RegisterInput = z.infer<typeof RegisterDto>;
