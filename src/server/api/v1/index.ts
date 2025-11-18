import { authRoutes } from "@/features/auth/router/authRouter";
import { profileRoutes } from "@/features/profile/router/profileRouter";
import { roomRoutes } from "@/features/groups/router/roomRouter";

export const apiV1Routes = [...authRoutes, ...profileRoutes, ...roomRoutes];

// later we can add more routes here
