import { roomsController } from "../controllers/roomsController.js";

export async function roomsApiV1(req: Request): Promise<Response | null> {
  const { pathname } = new URL(req.url);

  if (!pathname.startsWith("/api/v1/rooms")) return null;

  if (req.method === "POST" && pathname === "/api/v1/rooms/create") {
    return roomsController.createRoom({ request: req });
  }

  if (req.method === "GET" && pathname === "/api/v1/rooms") {
    return roomsController.listRooms({ request: req });
  }

  return null;
}
