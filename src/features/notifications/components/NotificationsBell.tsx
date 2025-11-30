"use client";

import { useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";
import {
    useCombinedNotifications,
    CombinedNotification,
} from "../hooks/useCombinedNotifications";

type Props = {
    onRoomInviteAccepted?: () => void;
    onFriendAccepted?: () => void;
};

const GROUPS_API_BASE = "/api/v1/groups";
const FRIEND_RESPOND_API = "/api/v1/friends/requests/respond";

export default function NotificationsBell({
    onRoomInviteAccepted,
    onFriendAccepted,
}: Props) {
    const { request } = useFetch();
    const { notifications, loading, error, reload, removeNotification } =
        useCombinedNotifications();

    const [open, setOpen] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [workingId, setWorkingId] = useState<number | null>(null);

    const hasNotifications = notifications.length > 0;

    async function handleRoomAction(
        notif: Extract<CombinedNotification, { kind: "room_invite" }>,
        action: "accept" | "decline"
    ) {
        setActionError(null);
        setWorkingId(notif.id);
        try {
            const endpoint =
                action === "accept"
                    ? `${GROUPS_API_BASE}/${notif.roomId}/invite/accept`
                    : `${GROUPS_API_BASE}/${notif.roomId}/invite/decline`;

            await request(endpoint, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: notif.id }),
            });

            removeNotification(notif.id);

            if (action === "accept" && onRoomInviteAccepted) {
                onRoomInviteAccepted();
            }
        } catch (err: any) {
            setActionError(err?.message || `Failed to ${action} room invite`);
            await reload();
        } finally {
            setWorkingId(null);
        }
    }

    async function handleFriendAction(
        notif: Extract<CombinedNotification, { kind: "friend_request" }>,
        action: "accept" | "decline"
    ) {
        setActionError(null);
        setWorkingId(notif.id);
        try {
            await request(FRIEND_RESPOND_API, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notificationId: notif.id,
                    fromUserId: notif.fromUserId,
                    action,
                }),
            });

            removeNotification(notif.id);

            if (action === "accept" && onFriendAccepted) {
                onFriendAccepted();
            }
        } catch (err: any) {
            setActionError(
                err?.message || `Failed to ${action} friend request`
            );
            await reload();
        } finally {
            setWorkingId(null);
        }
    }

    return (
        <div className="relative z-60">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm text-xs font-medium text-gray-700 cursor-pointer"
            >
                <span>Notifications</span>
                {hasNotifications && (
                    <span className="inline-flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full w-4 h-4">
                        {notifications.length}
                    </span>
                )}
            </button>

            {open && (
                <section className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-80 text-xs">
                    <header className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                            Notifications
                        </span>
                        <button
                            className="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer"
                            onClick={reload}
                            type="button"
                        >
                            Refresh
                        </button>
                    </header>

                    {loading && (
                        <div className="px-3 py-3 text-gray-400">
                            Loading notifications…
                        </div>
                    )}

                    {!loading && notifications.length === 0 && !error && (
                        <div className="px-3 py-3 text-gray-400">
                            No pending notifications.
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
                                {n.kind === "room_invite" && (
                                    <>
                                        <p className="text-[11px] text-gray-700 mb-1">
                                            Room invite to{" "}
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
                                                    handleRoomAction(
                                                        n,
                                                        "accept"
                                                    )
                                                }
                                                disabled={workingId === n.id}
                                                className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm cursor-pointer ${
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
                                                    handleRoomAction(
                                                        n,
                                                        "decline"
                                                    )
                                                }
                                                disabled={workingId === n.id}
                                                className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm cursor-pointer ${
                                                    workingId === n.id
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </>
                                )}

                                {n.kind === "friend_request" && (
                                    <>
                                        <p className="text-[11px] text-gray-700 mb-1">
                                            Friend request from{" "}
                                            <span className="font-semibold">
                                                {n.fromDisplayName ||
                                                    n.fromEmail}
                                            </span>
                                        </p>
                                        {n.fromDisplayName && (
                                            <p className="text-[11px] text-gray-500 mb-2">
                                                ({n.fromEmail})
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFriendAction(
                                                        n,
                                                        "accept"
                                                    )
                                                }
                                                disabled={workingId === n.id}
                                                className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm cursor-pointer ${
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
                                                    handleFriendAction(
                                                        n,
                                                        "decline"
                                                    )
                                                }
                                                disabled={workingId === n.id}
                                                className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-semibold shadow-sm cursor-pointer ${
                                                    workingId === n.id
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
