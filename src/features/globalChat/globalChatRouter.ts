import { route } from "rwsdk/router";
import globalChatController from "./controllers/globalChatController";

type AppRoute = ReturnType<typeof route>;

export const createGlobalChatRoutes = (
    controller: typeof globalChatController
): AppRoute[] => [route("/chat/global", controller.global)];

export const globalChatRoutes = createGlobalChatRoutes(globalChatController);

export default globalChatRoutes;
