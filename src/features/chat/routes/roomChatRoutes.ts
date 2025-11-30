import { route } from "rwsdk/router";
import roomChatController from "../controllers/roomChatController";

type AppRoute = ReturnType<typeof route>;

export const createRoomChatRoutes = (
    controller: typeof roomChatController
): AppRoute[] => [route("/groups/:roomId/messages", controller.messages)];

export const roomChatRoutes = createRoomChatRoutes(roomChatController);
export default roomChatRoutes;
