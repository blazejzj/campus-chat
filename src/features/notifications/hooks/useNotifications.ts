"use client";

import { useEffect, useState, useCallback } from "react";
import { useFetch } from "@/app/hooks/useFetch";

export type RoomInviteNotification = {
    id: number;
    roomId: number;
    roomName: string;
    invitedByEmail: string;
    createdAt: string | null;
};

type ApiNotification = {
    id: number;
    type: string;
    payload: {
        roomId?: number;
        roomName?: string;
        invitedByUserId?: number;
        invitedByEmail?: string;
    } | null;
    createdAt: string | null;
    readAt: string | null;
};

const API_BASE_PATH = "/api/v1/notifications";

export function useRoomInviteNotifications() {
    const { request } = useFetch();
    const [notifications, setNotifications] = useState<
        RoomInviteNotification[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await request<{
                ok: boolean;
                data?: ApiNotification[];
            }>(`${API_BASE_PATH}?type=room_invite&unread=true`, {
                method: "GET",
                credentials: "include",
            });

            if (result.ok && result.data) {
                const mapped: RoomInviteNotification[] = result.data
                    .filter((n) => n.type === "room_invite" && n.payload)
                    .map((n) => ({
                        id: n.id,
                        roomId: n.payload?.roomId ?? 0,
                        roomName: n.payload?.roomName ?? "Unknown room",
                        invitedByEmail:
                            n.payload?.invitedByEmail ?? "Unknown user",
                        createdAt: n.createdAt,
                    }));

                setNotifications(mapped);
            } else {
                setNotifications([]);
            }
        } catch (err: any) {
            console.error("Error loading notifications:", err);
            setError(err.message || "Failed to load notifications");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return { notifications, loading, error, reload: load, removeNotification };
}
