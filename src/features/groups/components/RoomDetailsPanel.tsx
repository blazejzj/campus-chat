"use client";

import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";

interface RoomDetailsPanelProps {
    roomId: string | number;
    canDelete: boolean;
    onDeleted: (roomId: string | number) => void;
}

const API_BASE_PATH = "/api/v1/groups";

type RoomMember = {
    id: string;
    email: string;
    displayName: string | null;
};

const GROUPS_API_BASE = "/api/v1/groups";

export default function RoomDetailsPanel({
    roomId,
    canDelete,
    onDeleted,
}: RoomDetailsPanelProps) {
    const { request, error, setError, loading } = useFetch();

    const [deleting, setDeleting] = useState(false);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [inviteMessage, setInviteMessage] = useState<string | null>(null);

    const [members, setMembers] = useState<RoomMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);

    const [leaving, setLeaving] = useState(false);

    const loadMembers = useCallback(async () => {
        setLoadingMembers(true);
        setMembersError(null);
        try {
            const result = await request<RoomMember[]>(
                `${GROUPS_API_BASE}/${roomId}/members`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (Array.isArray(result)) {
                setMembers(result);
            } else {
                setMembers([]);
            }
        } catch (err: any) {
            setMembersError(err.message || "Failed to load room members");
            setMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    }, [roomId]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleDelete = async () => {
        if (!canDelete || deleting) return;

        setError("");
        setInviteMessage(null);

        try {
            setDeleting(true);
            await request(`${API_BASE_PATH}/${roomId}`, {
                method: "DELETE",
                credentials: "include",
            });

            onDeleted(roomId);
        } catch (err: any) {
            setError(err.message || "Could not delete room");
        } finally {
            setDeleting(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim() || inviting) return;

        setError("");
        setInviteMessage(null);

        try {
            setInviting(true);
            await request(`${API_BASE_PATH}/${roomId}/invite`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail.trim() }),
            });

            setInviteMessage("Invitation sent");
            setInviteEmail("");
        } catch (err: any) {
            setError(err.message || "Could not send invitation");
        } finally {
            setInviting(false);
        }
    };

    const handleLeave = async () => {
        // we dont want admins to leave the room
        if (canDelete || leaving) return;

        setError("");
        setInviteMessage(null);

        try {
            setLeaving(false);
            await request(`${API_BASE_PATH}/${roomId}/leave`, {
                method: "POST",
                credentials: "include",
            });

            // honestly, from UI perspective, "leave" is the same as "room removed from my list"
            // so i'll use it xD
            onDeleted(roomId);
        } catch (err: any) {
            setError(err.msg || "Could not leave room");
        } finally {
            setLeaving(false);
        }
    };

    return (
        <div className="mt-1 mx-2 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold theme-text-color">
                    Members ({members.length}
                    {loadingMembers ? "..." : ""})
                </h4>
            </div>

            {membersError && (
                <p className="text-[11px] text-red-600 mb-1">{membersError}</p>
            )}

            <ul className="grid grid-cols-2 gap-1 text-[11px] text-gray-700 max-h-20 overflow-y-auto pr-1 mb-3">
                {loadingMembers && members.length === 0 && (
                    <li className="text-gray-400 italic">Loading members…</li>
                )}

                {!loadingMembers && members.length === 0 && !membersError && (
                    <li className="text-gray-400 italic">No members yet.</li>
                )}

                {members.map((member) => (
                    <li
                        key={member.id}
                        className="p-1 bg-white rounded border border-gray-200 truncate"
                        title={member.email}
                    >
                        {member.displayName || member.email}
                    </li>
                ))}
            </ul>

            {canDelete ? (
                <>
                    <form onSubmit={handleInvite} className="mb-3">
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Invite by email
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="student@example.com"
                                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-(--primary-color)"
                            />
                            <button
                                type="submit"
                                disabled={
                                    !inviteEmail.trim() || inviting || loading
                                }
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold shadow-sm cursor-pointer ${
                                    !inviteEmail.trim() || inviting || loading
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                }`}
                            >
                                {inviting ? "Sending..." : "Invite"}
                            </button>
                        </div>
                    </form>

                    {inviteMessage && (
                        <p className="text-[11px] text-green-600 mb-1">
                            {inviteMessage}
                        </p>
                    )}

                    {error && (
                        <p className="text-[11px] text-red-600 mb-2 font-medium">
                            {error}
                        </p>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={deleting || loading}
                        className={`w-full px-2 py-1 rounded-lg transition shadow-sm text-[11px] font-semibold ${
                            deleting || loading
                                ? "bg-red-300 cursor-not-allowed text-white"
                                : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                        }`}
                    >
                        {deleting || loading ? "Deleting..." : "Delete Room"}
                    </button>
                </>
            ) : (
                <>
                    {error && (
                        <p className="text-[11px] text-red-600 mb-2 font-medium">
                            {error}
                        </p>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleLeave}
                            disabled={leaving || loading}
                            className="cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {leaving || loading ? "Leaving…" : "Leave room"}{" "}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
