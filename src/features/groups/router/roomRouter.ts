import { route } from "rwsdk/router";
import roomController from "../controllers/roomController";

type AppRoute = ReturnType<typeof route>;

export const createRoomRoutes = (
    controller: typeof roomController
): AppRoute[] => [
    route("/groups", controller.getRooms),
    route("/groups/create", controller.createRoom),
    route("/groups/:roomId", controller.deleteRoom),
    route("/groups/:roomId/invite", controller.inviteUser),
    route("/groups/:roomId/members", controller.getRoomMembers),
    route("/groups/:roomId/invite/accept", controller.acceptInvite),
    route("/groups/:roomId/invite/decline", controller.declineInvite),
    route("/groups/:roomId/leave", controller.leaveRoom),
];

export const roomRoutes = createRoomRoutes(roomController);

export default roomRoutes;
