"use client";

import { useEffect, useState, useCallback } from "react";
import { useFetch } from "@/app/hooks/useFetch";

export type FriendRequestNotification = {
    id: number;
    fromUserId: number;
    fromEmail: string;
    fromDisplayName: string | null;
    createdAt: string | null;
};

type ApiNotification = {
    id: number;
    type: string;
    payload: {
        fromUserId?: number;
        fromEmail?: string;
        fromDisplayName?: string | null;
    } | null;
    createdAt: string | null;
    readAt: string | null;
};

const API_BASE_PATH = "/api/v1/notifications";

export function useFriendRequestNotifications() {
    const { request } = useFetch();
    const [notifications, setNotifications] = useState<
        FriendRequestNotification[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await request<ApiNotification[]>(
                `${API_BASE_PATH}?type=friend_request&unread=true`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const mapped: FriendRequestNotification[] = result
                .filter((n) => n.type === "friend_request" && n.payload)
                .map((n) => ({
                    id: n.id,
                    fromUserId: n.payload?.fromUserId ?? 0,
                    fromEmail: n.payload?.fromEmail ?? "unknown@user",
                    fromDisplayName: n.payload?.fromDisplayName ?? null,
                    createdAt: n.createdAt,
                }));

            setNotifications(mapped);
        } catch (err: any) {
            setError(err.message || "Failed to load friend requests");
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
