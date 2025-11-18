import { route } from "rwsdk/router";
import { roomController } from "../controllers/roomController";

const ApiBase = "/groups"; 

export const roomRoutes = [
    route(ApiBase, roomController.getRooms),
    route(ApiBase + "/create", roomController.createRoom),
];
