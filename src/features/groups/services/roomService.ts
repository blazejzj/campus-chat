import roomRepository from "../repository/roomRepository";
import { RoomCreateInput } from "../dto";
import { CreateRoomResult, RoomResponse, RoomFromRepo } from "../types/types";

async function getInternalIdFromExternalId(externalId: string): Promise<string> {
    if (!externalId) {
        throw new Error("USER_NOT_FOUND"); 
    }
    return '1'; 
}

function mapVisibility(value: string | null): "public" | "private" | undefined {
  if (value === "public" || value === "private") return value as "public" | "private"; 
  return undefined;
}

export const roomService = {
  async createRoom(
    input: RoomCreateInput,
    creatorExternalId: string 
  ): Promise<CreateRoomResult & { room?: RoomResponse }> {
    try {
      if (!roomRepository || typeof roomRepository.createRoom !== 'function') {
        console.error("CRITICAL ERROR: roomRepository is missing or its methods are not exported.");
        throw new Error("Repository initialization failed.");
      }

      const creatorInternalId = await getInternalIdFromExternalId(creatorExternalId);
      
      const roomId = await roomRepository.createRoom({
        name: input.name,
        visibility: input.visibility,
        createdBy: creatorInternalId,
      });

      if (!roomId) {
        return { ok: false, reason: "ROOM_CREATION_FAILED" };
      }

      const room: RoomResponse = {
        id: roomId.toString(),
        name: input.name,
        visibility: input.visibility,
        createdBy: creatorExternalId,
      };

      return { ok: true, id: room.id, room };

    } catch (error: any) {
      console.error("Room service creation error:", error);
      throw error; 
    }
  },

  async getRoomsForUser(externalUserId: string): Promise<RoomResponse[]> {
  try {
    if (!roomRepository || typeof roomRepository.findRoomsByUserId !== 'function') {
      console.error("CRITICAL ERROR: roomRepository is missing or its findRoomsByUserId method is not exported.");
      throw new Error("Repository initialization failed.");
    }
    
    const internalUserId = await getInternalIdFromExternalId(externalUserId);
    
    const rooms = (await roomRepository.findRoomsByUserId(internalUserId)) as RoomFromRepo[];

    return rooms.map((room: RoomFromRepo) => ({
      id: room.id.toString(),
      name: room.name,
      visibility: mapVisibility(room.visibility),
      createdBy: room.createdBy ? room.createdBy.toString() : externalUserId, 
    }));
  } catch (error: any) {
    console.error("Room service getRoomsForUser CRASHED with error:", error.message || error);
    throw error;
  }
},

  async getRoomIfAuthorized(roomId: string, externalUserId: string): Promise<RoomResponse | null> {
  try {
    const internalUserId = await getInternalIdFromExternalId(externalUserId);

    const room = await roomRepository.findRoomIfAuthorized(roomId, internalUserId) as RoomFromRepo | null;
    
    if (!room) return null;

    return {
      id: room.id.toString(),
      name: room.name,
      visibility: mapVisibility(room.visibility),
      createdBy: room.createdBy ? room.createdBy.toString() : externalUserId,
    };
  } catch (error: any) {
    console.error("Room service getRoomIfAuthorized error:", error);
    throw error;
  }
},

  async getPaginatedMessages(roomId: string, limit: number, offset: number) {
    try {
      return await roomRepository.getPaginatedMessages(roomId, limit, offset);
    } catch (error: any) {
      console.error("Error in getPaginatedMessages:", error);
      throw new Error("DATABASE_ERROR");
    }
  }
};

export default roomService;