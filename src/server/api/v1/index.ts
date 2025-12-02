import { authRoutes } from "@/features/auth/router/authRouter";
import { profileRoutes } from "@/features/profile/router/profileRouter";
import { roomRoutes } from "@/features/groups/router/roomRouter";
import notificationRoutes from "@/features/notifications/routes/notificationRoutes";
import friendsRoutes from "@/features/friends/routes/friendsRoutes";
import { dmChatRoutes } from "@/features/chat/routes/dmChatRoutes";
import roomChatRoutes from "@/features/chat/routes/roomChatRoutes";
import globalChatRoutes from "@/features/globalChat/router/globalChatRoutes";
import devSeedRoutes from "./devSeedRoutes";

export const apiV1Routes = [
    ...authRoutes,
    ...globalChatRoutes,
    ...profileRoutes,
    ...roomRoutes,
    ...notificationRoutes,
    ...friendsRoutes,
    ...dmChatRoutes,
    ...roomChatRoutes,

    // this is only for seeding!
    // probably not something we'd do in real scenario!
    ...devSeedRoutes,
];
