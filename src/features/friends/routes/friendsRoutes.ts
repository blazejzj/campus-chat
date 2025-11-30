import { route } from "rwsdk/router";
import friendsController from "../controllers/friendsController";

type AppRoute = ReturnType<typeof route>;

export const createFriendsRoutes = (
    controller: typeof friendsController
): AppRoute[] => [route("/friends", controller.friends)];

export const friendsRoutes = createFriendsRoutes(friendsController);

export default friendsRoutes;
