"use client";

import { useEffect, useState, useCallback } from "react";
import { useFetch } from "@/app/hooks/useFetch";

// TODO: Change this to global config, im constantly reusing those...
const GROUPS_API_BASE = "/api/v1/groups";
const API_BASE_PATH = "/api/v1/notifications";

type RoomInviteNotification = {
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

export default function RoomInviteNotificationsBell() {
    const { request } = useFetch();

    const [notifications, setNotifications] = useState<
        RoomInviteNotification[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [workingId, setWorkingId] = useState<number | null>(null);

    const hasNotifications = notifications.length > 0;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await request<ApiNotification[]>(
                `${API_BASE_PATH}?type=room_invite&unread=true`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const mapped: RoomInviteNotification[] = result
                .filter((n) => n.type === "room_invite" && n.payload)
                .map((n) => ({
                    id: n.id,
                    roomId: n.payload?.roomId ?? 0,
                    roomName: n.payload?.roomName ?? "Unknown room",
                    invitedByEmail: n.payload?.invitedByEmail ?? "Unknown user",
                    createdAt: n.createdAt,
                }));

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
    }, []);

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleAccept = async (nId: number, roomId: number) => {
        setActionError(null);
        setWorkingId(nId);
        try {
            await request(`${GROUPS_API_BASE}/${roomId}/invite/accept`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: nId }),
            });
            removeNotification(nId);
        } catch (err: any) {
            setActionError(err.message || "Failed to accept invite");
            await load();
        } finally {
            setWorkingId(null);
        }
    };

    const handleDecline = async (nId: number, roomId: number) => {
        setActionError(null);
        setWorkingId(nId);
        try {
            await request(`${GROUPS_API_BASE}/${roomId}/invite/decline`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: nId }),
            });
            removeNotification(nId);
        } catch (err: any) {
            setActionError(err.message || "Failed to decline invite");
            await load();
        } finally {
            setWorkingId(null);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm text-xs font-medium text-gray-700"
            >
                <span>Notifications</span>
                {hasNotifications && (
                    <span className="inline-flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full w-4 h-4">
                        {notifications.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-30 text-xs">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                            Room invites
                        </span>
                        <button
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                            onClick={load}
                            type="button"
                        >
                            Refresh
                        </button>
                    </div>

                    {loading && (
                        <div className="px-3 py-3 text-gray-400">
                            Loading invitations…
                        </div>
                    )}

                    {!loading && notifications.length === 0 && !error && (
                        <div className="px-3 py-3 text-gray-400">
                            No pending invitations.
                        </div>
                    )}

                    {error && (
                        <div className="px-3 py-2 text-red-600 border-t border-red-100 bg-red-50">
                            {error}
                        </div>
                    )}

                    {actionError && (
                        <div className="px-3 py-2 text-red-600 border-t border-red-100 bg-red-50">
                            {actionError}
                        </div>
                    )}

                    <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <li key={n.id} className="px-3 py-2">
                                <p className="text-[11px] text-gray-700 mb-1">
                                    <span className="font-semibold">
                                        {n.roomName}
                                    </span>
                                </p>
                                <p className="text-[11px] text-gray-500 mb-2">
                                    Invited by{" "}
                                    <span className="font-medium">
                                        {n.invitedByEmail}
                                    </span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleAccept(n.id, n.roomId)
                                        }
                                        disabled={workingId === n.id}
                                        className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm ${
                                            workingId === n.id
                                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                : "bg-green-500 text-white hover:bg-green-600"
                                        }`}
                                    >
                                        {workingId === n.id
                                            ? "Working..."
                                            : "Accept"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDecline(n.id, n.roomId)
                                        }
                                        disabled={workingId === n.id}
                                        className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm ${
                                            workingId === n.id
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
