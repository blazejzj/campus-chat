"use client";

import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";

export type CombinedNotification =
    | {
          kind: "room_invite";
          id: number;
          createdAt: string | null;
          roomId: number;
          roomName: string;
          invitedByEmail: string;
      }
    | {
          kind: "friend_request";
          id: number;
          createdAt: string | null;
          fromUserId: number;
          fromEmail: string;
          fromDisplayName: string | null;
      };

type ApiNotification = {
    id: number;
    type: string;
    payload: any | null;
    createdAt: string | null;
    readAt: string | null;
};

const API_BASE_PATH = "/api/v1/notifications";

export function useCombinedNotifications() {
    const { request } = useFetch();
    const [notifications, setNotifications] = useState<CombinedNotification[]>(
        []
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await request<ApiNotification[]>(
                `${API_BASE_PATH}?unread=true`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const mapped: CombinedNotification[] = result.flatMap(
                (n): CombinedNotification[] => {
                    if (!n.payload) return [];

                    if (n.type === "room_invite") {
                        return [
                            {
                                kind: "room_invite",
                                id: n.id,
                                createdAt: n.createdAt,
                                roomId: n.payload.roomId ?? 0,
                                roomName: n.payload.roomName ?? "Unknown room",
                                invitedByEmail:
                                    n.payload.invitedByEmail ?? "Unknown user",
                            },
                        ];
                    }

                    if (n.type === "friend_request") {
                        return [
                            {
                                kind: "friend_request",
                                id: n.id,
                                createdAt: n.createdAt,
                                fromUserId: n.payload.fromUserId ?? 0,
                                fromEmail:
                                    n.payload.fromEmail ?? "unknown@user",
                                fromDisplayName:
                                    n.payload.fromDisplayName ?? null,
                            },
                        ];
                    }

                    return [];
                }
            );

            setNotifications(mapped);
        } catch (err: any) {
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
