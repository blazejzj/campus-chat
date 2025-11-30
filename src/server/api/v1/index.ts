import { authRoutes } from "@/features/auth/router/authRouter";
import { profileRoutes } from "@/features/profile/router/profileRouter";
import { roomRoutes } from "@/features/groups/router/roomRouter";
import globalChatRoutes from "@/features/globalChat/router/globalChatRouter";
import notificationRoutes from "@/features/notifications/routes/notificationRoutes";
import friendsRoutes from "@/features/friends/routes/friendsRoutes";

export const apiV1Routes = [
    ...authRoutes,
    ...globalChatRoutes,
    ...profileRoutes,
    ...roomRoutes,
    ...notificationRoutes,
    ...friendsRoutes,
];
