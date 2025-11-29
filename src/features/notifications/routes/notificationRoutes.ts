import { route } from "rwsdk/router";
import notificationController from "../controllers/notificationController";

type AppRoute = ReturnType<typeof route>;

export const createNotificationRoutes = (
    controller: typeof notificationController
): AppRoute[] => [route("/notifications", controller.listNotifications)];

export const notificationRoutes = createNotificationRoutes(
    notificationController
);

export default notificationRoutes;
