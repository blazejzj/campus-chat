import { authRoutes } from "@/features/auth/router/authRouter";
import globalChatRoutes from "@/features/globalChat/router/authRouter";

export const apiV1Routes = [
    ...authRoutes,
    ...globalChatRoutes,
    // later we can add more routes here
];
