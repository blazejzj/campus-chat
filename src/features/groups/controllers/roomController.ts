import { json } from "@/app/utils/responseJson";
import type { RequestInfo } from "rwsdk/worker";
import roomService from "../services/roomService";
import { RoomCreateDto } from "../dto";

type User = {
    id: string | number;
    email: string;
};

function getUserIdFromContext(ctx: RequestInfo): string | null {
    
    const user = (ctx as any).user; 
    const userNested = (ctx as any).ctx?.user;
    const finalUser = userNested && userNested.id ? userNested : user;

    // debuggss LOG
    if (finalUser && finalUser.id) {
        console.log(`[ROOM-DIAG] Final User ID Extracted: ${finalUser.id}.`);
        return String(finalUser.id);
    }
    
    // If we reach here, context was lost.
    console.error("[ROOM-DIAG] Context lost: Could not find user ID on ctx or ctx.ctx.");
    return null;
}

export const roomController = {
    async getRooms(ctx: RequestInfo): Promise<Response> {
        if (ctx.request.method.toUpperCase() !== "GET") {
            return json({ error: "Method Not Allowed" }, 405, { Allow: "GET" });
        }

        const userId = getUserIdFromContext(ctx);
        
        if (!userId) {
            console.error("[ROOM-DIAG] FAILED to retrieve userId, though auth passed. Returning 401.");
            return json({ error: "Unauthorized" }, 401); 
        }

        try {
            console.log(`[ROOM-DIAG] Attempting to fetch rooms for User ID: ${userId}`);
            const rooms = await roomService.getRoomsForUser(userId);
            console.log(`[ROOM-DIAG] Successfully retrieved ${rooms.length} rooms. Status 200.`);
            return json(rooms, 200); 
        } catch (error: any) {
            console.error("[ROOM-CRASH] Critical Error in roomService.getRoomsForUser:", error);
            return json({ error: "Internal Server Error" }, 500);
        }
    },

    async createRoom(ctx: RequestInfo): Promise<Response> {
        if (ctx.request.method.toUpperCase() !== "POST") {
            return json({ error: "Method Not Allowed" }, 405, { Allow: "POST" });
        }

        const userId = getUserIdFromContext(ctx);
        if (!userId) return json({ error: "Unauthorized" }, 401);

        let body;
        try {
            body = await ctx.request.json();
        } catch {
            return json({ error: "Invalid JSON body" }, 400);
        }

        const parsed = RoomCreateDto.safeParse(body);
        if (!parsed.success) {
            return json(
                { error: "ValidationError", details: parsed.error.format() },
                400
            );
        }

        try {
            const result = await roomService.createRoom(parsed.data, userId);

            if (!result.ok) {
                return json(
                    {
                        error:
                            result.reason === "DATABASE_ERROR"
                                ? "Database operation failed"
                                : "Room creation failed",
                    },
                    500
                );
            }
            return json(result.room, 201); 
        } catch (error: any) {
            console.error("Unexpected error creating room:", error);
            return json({ error: "Internal Server Error" }, 500);
        }
    },
};