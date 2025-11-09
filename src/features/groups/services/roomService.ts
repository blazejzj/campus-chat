import roomRepository from "../repository/roomRepository";
import { RoomCreateInput } from "../dto";
import { CreateRoomResult, RoomResponse } from "../types/types";


function mapVisibility(value: string | null): "public" | "private" | undefined {
  if (value === "public" || value === "private") return value;
  return undefined;
}

export const roomService = {
  async createRoom(
    input: RoomCreateInput,
    creatorId: string
  ): Promise<CreateRoomResult & { room?: RoomResponse }> {
    try {
      const roomId = await roomRepository.createRoom({
        name: input.name,
        visibility: input.visibility,
        createdBy: creatorId,
      });

      if (!roomId) {
        return { ok: false, reason: "ROOM_CREATION_FAILED" };
      }

      const room: RoomResponse = {
        id: roomId.toString(),
        name: input.name,
        visibility: input.visibility,
        createdBy: creatorId,
      };

      return { ok: true, id: room.id, room };

    } catch (error: any) {
      console.error("Room service creation error:", error);
      if (error.message === "DATABASE_ERROR") {
        return { ok: false, reason: "DATABASE_ERROR" };
      }
      return { ok: false, reason: "ROOM_CREATION_FAILED" };
    }
  },

  async getRoomsForUser(userId: string): Promise<RoomResponse[]> {
  try {
    const rooms = await roomRepository.findRoomsByUserId(userId);

    return rooms.map(room => ({
      id: room.id.toString(),
      name: room.name,
      visibility: mapVisibility(room.visibility),
      createdBy: room.createdBy ? room.createdBy.toString() : null,
    }));
  } catch (error: any) {
    console.error("Room service getRoomsForUser error:", error);
    throw new Error("DATABASE_ERROR");
  }
},

  async getRoomIfAuthorized(roomId: string, userId: string): Promise<RoomResponse | null> {
  try {
    const room = await roomRepository.findRoomIfAuthorized(roomId, userId);
    if (!room) return null;

    return {
      id: room.id.toString(),
      name: room.name,
      visibility: mapVisibility(room.visibility),
      createdBy: room.createdBy ? room.createdBy.toString() : null,
    };
  } catch (error: any) {
    console.error("Room service getRoomIfAuthorized error:", error);
    throw new Error("DATABASE_ERROR");
  }
},
};

export default roomService;
