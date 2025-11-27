import { route } from "rwsdk/router";
import globalChatController from "../controllers/globalChatController";
import { links } from "@/app/links";

type AppRoute = ReturnType<typeof route>;

export const createGlobalChatRoutes = (
    controller: typeof globalChatController
): AppRoute[] => [
    // same path, controller will take controll of get/post
    route(links.api.chat.global, controller.global),
];

export const globalChatRoutes = createGlobalChatRoutes(globalChatController);

export default globalChatRoutes;
