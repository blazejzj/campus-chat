import { route } from "rwsdk/router";
import friendsController from "../controllers/friendsController";

type AppRoute = ReturnType<typeof route>;

export const createFriendsRoutes = (
    controller: typeof friendsController
): AppRoute[] => [
    route("/friends", controller.friends),
    route("/friends/requests/respond", controller.respondToFriendRequest), // this will look {fromUserId, notificationId, action: "accept" | decline} thats the idea atelast
];

export const friendsRoutes = createFriendsRoutes(friendsController);

export default friendsRoutes;
