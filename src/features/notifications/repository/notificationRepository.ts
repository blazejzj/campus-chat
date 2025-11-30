import db from "@/server/db";
import { notifications } from "@/server/db/notificationSchema";
import { AsyncResult } from "@/app/types/result";
import { Errors } from "@/app/types/errors";
import { and, eq, isNull } from "drizzle-orm";

type NotificationRow = typeof notifications.$inferSelect;

export const createNotificationRepository = (dbInstance: typeof db) => ({
    async getNotificationsForUser(
        userId: number,
        options?: { type?: string; unreadOnly?: boolean }
    ): AsyncResult<NotificationRow[]> {
        try {
            const conditions = [eq(notifications.userId, userId)];

            if (options?.type) {
                conditions.push(eq(notifications.type, options.type));
            }

            if (options?.unreadOnly) {
                conditions.push(isNull(notifications.readAt));
            }

            const rows = await dbInstance
                .select()
                .from(notifications)
                .where(and(...conditions));

            return { ok: true, data: rows };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async createNotification(input: {
        userId: number;
        type: string;
        payload?: unknown;
    }): AsyncResult<NotificationRow> {
        try {
            const now = new Date();
            const [row] = await dbInstance
                .insert(notifications)
                .values({
                    userId: input.userId,
                    type: input.type,
                    payload:
                        input.payload !== undefined
                            ? JSON.stringify(input.payload)
                            : null,
                    createdAt: now,
                })
                .returning();

            console.log("created :)");
            return { ok: true, data: row };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },

    async markNotificationAsRead(id: number): AsyncResult<null> {
        try {
            const now = new Date();
            await dbInstance
                .update(notifications)
                .set({ readAt: now })
                .where(eq(notifications.id, id));

            return { ok: true, data: null };
        } catch (error) {
            return { ok: false, reason: Errors.DATABASE_ERROR };
        }
    },
});

export const notificationRepository = createNotificationRepository(db);

export default notificationRepository;
