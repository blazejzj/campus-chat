import { route } from "rwsdk/router";
import { authController } from "../controllers/authController";
import { links } from "@/app/links";

type AppRoute = ReturnType<typeof route>;

export const createAuthRoutes = (
    controller: typeof authController
): AppRoute[] => [
    route("/auth/register", controller.register),
    route("/auth/login", controller.login),
    route("/auth/logout", controller.logout),
];

export const authRoutes = createAuthRoutes(authController);

export default authRoutes;
