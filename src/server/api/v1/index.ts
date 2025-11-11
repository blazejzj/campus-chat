import { authRoutes } from "@/features/auth/router/authRouter";
<<<<<<< HEAD
import { profileRoutes } from "@/features/profile/router/profileRouter";

export const apiV1Routes = [
    ...authRoutes,
    ...profileRoutes,
=======
import { roomRoutes } from "@/features/groups/router/roomRouter";

export const apiV1Routes = [
    ...authRoutes,
    ...roomRoutes,
>>>>>>> origin/main
    // later we can add more routes here
];
