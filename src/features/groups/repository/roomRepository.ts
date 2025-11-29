import { Errors } from "@/app/types/errors";
import { AsyncResult } from "@/app/types/result";
import { roomMemberships, rooms } from "@/server/db/roomSchema";
import { and, desc, eq, sql } from "drizzle-orm";
import { RoomCreateInput } from "../dto";
import { messages } from "@/server/db/messageSchema";
import db from "@/server/db";
import { profiles, users } from "@/server/db/userSchema";
import { notifications } from "@/server/db/notificationSchema";

// TODO: Probably move this to utils later
// slugify here is not mine: https://dev.to/bybydev/how-to-slugify-a-string-in-javascript-4o9n
const makeRoomSlug = (name: string): string => {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // remove consecutive hyphens

    const suffix = Date.now().toString(36);
    return `${base}-${suffix}`;
};

type RoomRow = typeof rooms.$inferSelect;

export const createRoomRepository = (dbInstace: typeof db) => ({
    async findRoomById(id: number): AsyncResult<RoomRow | null> {
        try {
            const [room] = await dbInstace
                .select()
                .from(rooms)
                .where(eq(rooms.id, id));

            return { ok: true, data: room ?? null };
        } catch (error) {
            // TODO: Better error handling
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    // create room -> as owner, duh
    async createRoom(
        data: RoomCreateInput & { createdBy: number }
    ): AsyncResult<number> {
        try {
            const now = new Date();
            const slug = makeRoomSlug(data.name);

            const [newRoom] = await dbInstace
                .insert(rooms)
                .values({
                    name: data.name,
                    visibility: "private", // keep field for future extension
                    createdBy: data.createdBy,
                    createdAt: now,
                    slug,
                })
                .returning({ id: rooms.id });

            await dbInstace.insert(roomMemberships).values({
                roomId: newRoom.id,
                userId: data.createdBy,
                role: "owner",
                joinedAt: now,
            });

            return { ok: true, data: newRoom.id };
        } catch (error) {
            // TODO: better handling here again
            // TODO: Create new error code -> Errors.ROOM_SLUG_TAKEN ?????
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    // check if a user is authorized to get in this room
    async findRoomIfAuthorized(
        roomId: number,
        userId: number
    ): AsyncResult<RoomRow | null> {
        try {
            const rows = await dbInstace
                .select({ room: rooms })
                .from(rooms)
                .leftJoin(
                    roomMemberships,
                    and(
                        eq(roomMemberships.roomId, rooms.id),
                        eq(roomMemberships.userId, userId)
                    )
                )
                .where(
                    and(
                        eq(rooms.id, roomId),
                        sql`${rooms.visibility} = 'public' OR ${roomMemberships.userId} IS NOT NULL`
                    )
                );

            const room = rows[0]?.room ?? null;

            return { ok: true, data: room };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async findRoomsByUserId(userId: number): AsyncResult<
        {
            id: number;
            name: string;
            visibility: string | null;
            createdBy: number | null;
            createdAt: Date | null;
            slug: string;
        }[]
    > {
        try {
            const rows = await dbInstace
                .select({
                    id: rooms.id,
                    name: rooms.name,
                    visibility: rooms.visibility,
                    createdBy: rooms.createdBy,
                    createdAt: rooms.createdAt,
                    slug: rooms.slug,
                })
                .from(roomMemberships)
                .innerJoin(rooms, eq(roomMemberships.roomId, rooms.id))
                .where(eq(roomMemberships.userId, userId));

            return { ok: true, data: rows };
        } catch (error) {
            // TODO: errors heres tooo handle plz
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    // paginated msgs in a room - nice for chat history later
    async getPaginatedMessages(
        roomId: number,
        limit: number,
        offset: number
    ): AsyncResult<(typeof messages.$inferSelect)[]> {
        try {
            const rows = await dbInstace
                .select()
                .from(messages)
                .where(eq(messages.roomId, roomId))
                .orderBy(desc(messages.id))
                .limit(limit)
                .offset(offset);

            return { ok: true, data: rows };
        } catch (error) {
            // TODO: errors here too
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async deleteRoom(roomId: number): AsyncResult<null> {
        try {
            // we have delete cascade so this should work

            // delete memberships
            await dbInstace
                .delete(roomMemberships)
                .where(eq(roomMemberships.roomId, roomId));

            // delete messages associated with room
            await dbInstace.delete(messages).where(eq(messages.roomId, roomId));

            // delete room
            await dbInstace.delete(rooms).where(eq(rooms.id, roomId));

            return { ok: true, data: null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async findUserByEmail(
        email: string
    ): AsyncResult<{ id: number; email: string } | null> {
        try {
            const [user] = await dbInstace
                .select({
                    id: users.id,
                    email: users.email,
                })
                .from(users)
                .where(eq(users.email, email));

            return { ok: true, data: user ?? null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async findUserById(
        id: number
    ): AsyncResult<{ id: number; email: string } | null> {
        try {
            const [user] = await dbInstace
                .select({
                    id: users.id,
                    email: users.email,
                })
                .from(users)
                .where(eq(users.id, id));

            return { ok: true, data: user ?? null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async isUserMemberOfRoom(
        roomId: number,
        userId: number
    ): AsyncResult<boolean> {
        try {
            const [row] = await dbInstace
                .select({ id: roomMemberships.id })
                .from(roomMemberships)
                .where(
                    and(
                        eq(roomMemberships.roomId, roomId),
                        eq(roomMemberships.userId, userId)
                    )
                )
                .limit(1);

            return { ok: true, data: !!row };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async createRoomInviteNotification(params: {
        userId: number;
        roomId: number;
        roomName: string;
        invitedByUserId: number;
        invitedByEmail: string;
    }): AsyncResult<null> {
        try {
            const now = new Date();

            const payload = JSON.stringify({
                roomId: params.roomId,
                roomName: params.roomName,
                invitedByUserId: params.invitedByUserId,
                invitedByEmail: params.invitedByEmail,
            });

            await dbInstace.insert(notifications).values({
                userId: params.userId,
                type: "room_invite",
                payload,
                createdAt: now,
                readAt: null,
            });

            return { ok: true, data: null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async getRoomMembers(
        roomId: number
    ): AsyncResult<
        { id: number; email: string; displayName: string | null }[]
    > {
        try {
            const rows = await dbInstace
                .select({
                    id: users.id,
                    email: users.email,
                    displayName: profiles.displayName,
                })
                .from(roomMemberships)
                .innerJoin(users, eq(roomMemberships.userId, users.id))
                .leftJoin(profiles, eq(profiles.userId, users.id))
                .where(eq(roomMemberships.roomId, roomId));

            return { ok: true, data: rows };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async getNotificationByIdForUser(
        notificationId: number,
        userId: number
    ): AsyncResult<typeof notifications.$inferSelect | null> {
        try {
            const [row] = await dbInstace
                .select()
                .from(notifications)
                .where(
                    and(
                        eq(notifications.id, notificationId),
                        eq(notifications.userId, userId)
                    )
                )
                .limit(1);

            return { ok: true, data: row ?? null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async markNotificationRead(notificationId: number): AsyncResult<null> {
        try {
            const now = new Date();
            await dbInstace
                .update(notifications)
                .set({ readAt: now })
                .where(eq(notifications.id, notificationId));

            return { ok: true, data: null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async addRoomMember(
        roomId: number,
        userId: number,
        role: string = "member"
    ): AsyncResult<null> {
        try {
            const now = new Date();

            await dbInstace.insert(roomMemberships).values({
                roomId,
                userId,
                role,
                joinedAt: now,
            });

            return { ok: true, data: null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },
});

export const roomRepository = createRoomRepository(db);

export default roomRepository;
