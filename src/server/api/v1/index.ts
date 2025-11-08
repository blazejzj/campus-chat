import { authRoutes } from "@/features/auth/router/authRouter";
import { profileRoutes } from "@/features/profile/router/profileRouter";

export const apiV1Routes = [
    ...authRoutes,
    ...profileRoutes,
    // later we can add more routes here
];
