import { route } from "rwsdk/router";
import profileController from "../controllers/profileController";

type AppRoute = ReturnType<typeof route>;

export const createProfileRoutes = (
    controller: typeof profileController
): AppRoute[] => [
    route("/profile", controller.profile),
    route("/profile/avatar", controller.avatar),
];

export const profileRoutes = createProfileRoutes(profileController);

export default profileRoutes;
