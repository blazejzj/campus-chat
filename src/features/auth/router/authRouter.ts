import { route } from "rwsdk/router";
import { authController } from "../controllers/authController";
import { links } from "@/app/links";

type AppRoute = ReturnType<typeof route>;

export const createAuthRoutes = (
    controller: typeof authController
): AppRoute[] => [
    route(links.api.auth.register, controller.register),
    route(links.api.auth.login, controller.login),
    route(links.api.auth.logout, controller.logout),
];

export const authRoutes = createAuthRoutes(authController);

export default authRoutes;
