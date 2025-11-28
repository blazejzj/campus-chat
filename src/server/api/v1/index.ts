import { authRoutes } from "@/features/auth/router/authRouter";
import { profileRoutes } from "@/features/profile/router/profileRouter";
import { roomRoutes } from "@/features/groups/router/roomRouter";
import globalChatRoutes from "@/features/globalChat/router/globalChatRouter";

export const apiV1Routes = [
    ...authRoutes,
    ...globalChatRoutes,
    ...profileRoutes,
    ...roomRoutes,
];
