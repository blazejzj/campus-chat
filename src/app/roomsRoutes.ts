import { route } from "rwsdk/router";
import { roomsController } from "@/features/rooms/controllers/roomsController";

export const roomRoutes = [
  // Base route: /api/v1/rooms
  route("/", async (ctx) => {
    const method = ctx.request.method.toLowerCase();
    switch (method) {
      // GET /api/v1/rooms - list all rooms
      case "get":
        return roomsController.listRooms(ctx);
      // POST /api/v1/rooms/create - create a new room
      case "post":
        return roomsController.createRoom(ctx);
      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  }),
];
