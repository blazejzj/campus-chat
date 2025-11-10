import { authRoutes } from "@/features/auth/router/authRouter";
import { roomRoutes } from "@/features/groups/router/roomRouter";

export const apiV1Routes = [
    ...authRoutes,
    ...roomRoutes,
    // later we can add more routes here
];
