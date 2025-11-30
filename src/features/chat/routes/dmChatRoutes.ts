import { route } from "rwsdk/router";
import dmChatController from "../controllers/dmChatController.ts";

type AppRoute = ReturnType<typeof route>;

export const createDmChatRoutes = (
    controller: typeof dmChatController
): AppRoute[] => [route("/dm/:friendId/messages", controller.messages)];

export const dmChatRoutes = createDmChatRoutes(dmChatController);
export default dmChatRoutes;
