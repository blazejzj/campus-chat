import db from "@/server/db";
import { rooms, roomMemberships, messages } from "@/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { RoomCreateInput } from "@/features/groups/dto";

export const roomRepository = {
  //find one room by its ID 
  async findRoomById(id: string) {
    try {
      const roomId = parseInt(id);
      const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
      return room ?? null;
    } catch (error) {
      console.error("Error finding room by ID:", error);
      throw new Error("DATABASE_ERROR");
    }
  },

  //create a new room and add the creator as a member
  async createRoom(data: RoomCreateInput & { createdBy: string }): Promise<number> {
    try {
      const now = new Date();
      const creatorId = parseInt(data.createdBy);

      const roomId = await db.transaction(async (tx) => {
        const [newRoom] = await tx
          .insert(rooms)
          .values({
            name: data.name,
            visibility: data.visibility,
            createdBy: creatorId,
            createdAt: now,
          })
          .returning({ id: rooms.id });

        await tx.insert(roomMemberships).values({
          roomId: newRoom.id,
          userId: creatorId,
          role: "owner",
          joinedAt: now,
        });

        return newRoom.id;
      });

      return roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw new Error("DATABASE_ERROR");
    }
  },

  //verify if a user can access a given room
  async findRoomIfAuthorized(roomId: string, userId: string) {
    try {
      const roomDbId = parseInt(roomId);
      const userDbId = parseInt(userId);

      const rows = await db
        .select({ room: rooms })
        .from(rooms)
        .leftJoin(
          roomMemberships,
          and(eq(roomMemberships.roomId, rooms.id), eq(roomMemberships.userId, userDbId))
        )
        .where(
          and(
            eq(rooms.id, roomDbId),
            sql`${rooms.visibility} = 'public' OR ${roomMemberships.userId} IS NOT NULL`
          )
        );

      return rows[0]?.room ?? null;
    } catch (error) {
      console.error("Error checking room authorization:", error);
      throw new Error("DATABASE_ERROR");
    }
  },

  //get all rooms a user is part of
  async findRoomsByUserId(userId: string) {
    try {
      const userDbId = parseInt(userId);

      return await db
        .select({
          id: rooms.id,
          name: rooms.name,
          createdBy: rooms.createdBy,
          createdAt: rooms.createdAt,
        })
        .from(roomMemberships)
        .innerJoin(rooms, eq(roomMemberships.roomId, rooms.id))
        .where(eq(roomMemberships.userId, userDbId));
    } catch (error) {
      console.error("Error finding rooms for user:", error);
      throw new Error("DATABASE_ERROR");
    }
  },

  //fetch paginated messages for a room
  async getPaginatedMessages(roomId: string, limit: number, offset: number) {
    try {
      const roomDbId = parseInt(roomId);

      return await db
        .select()
        .from(messages)
        .where(eq(messages.roomId, roomDbId))
        .orderBy(desc(messages.id))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error fetching paginated messages:", error);
      throw new Error("DATABASE_ERROR");
    }
  },
};

export default roomRepository;
