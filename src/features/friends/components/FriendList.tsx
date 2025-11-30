"use client";

import { useEffect, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";
import { links } from "@/app/links";

export type Friend = {
    userId: number;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
};

type FriendsListProps = {
    selectedFriendId: number | null;
    onSelectFriend: (friendId: number) => void;
    onFriendRemoved?: (friendId: number) => void;
    reloadToken?: number;
};

export default function FriendsList({
    selectedFriendId,
    onSelectFriend,
    onFriendRemoved,
    reloadToken,
}: FriendsListProps) {
    const { request, loading, error, setError } = useFetch();
    const [friends, setFriends] = useState<Friend[]>([]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [addEmail, setAddEmail] = useState("");
    const [addError, setAddError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    async function loadFriends() {
        try {
            const data = await request<Friend[]>(links.api.friends.friends, {
                method: "GET",
                credentials: "include",
            });
            setFriends(data);
        } catch {
            setFriends([]);
        }
    }

    useEffect(() => {
        loadFriends();
    }, [reloadToken]);

    async function handleRemove(friendId: number) {
        try {
            await request(links.api.friends.friends + "?friendId=" + friendId, {
                method: "DELETE",
                credentials: "include",
            });

            setFriends((prev) => prev.filter((f) => f.userId !== friendId));
            if (onFriendRemoved) onFriendRemoved(friendId);
        } catch (err: any) {
            setError(err?.message || "Failed to remove friend");
        }
    }

    async function handleAddFriend(e: React.FormEvent) {
        e.preventDefault();
        setAddError(null);

        const trimmed = addEmail.trim();
        if (!trimmed) {
            setAddError("Please enter an email.");
            return;
        }

        try {
            setAdding(true);

            console.log("sending", JSON.stringify({ email: trimmed }));
            await request(links.api.friends.friends, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: trimmed }),
            });

            setAddEmail("");
            setShowAddForm(false);
            await loadFriends();
        } catch (err: any) {
            const msg =
                err?.data?.message ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add friend";

            setAddError(msg);
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <h3 className="px-1 text-xs tracking-[0.18em] text-gray-400 font-semibold uppercase">
                    Friends
                </h3>

                <button
                    type="button"
                    onClick={() => {
                        setShowAddForm((prev) => !prev);
                        setAddError(null);
                    }}
                    className="cursor-pointer rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                >
                    {showAddForm ? "Cancel" : "Add friend"}
                </button>
            </div>

            {showAddForm && (
                <form
                    onSubmit={handleAddFriend}
                    className="px-3 pb-2 space-y-1"
                >
                    <input
                        type="email"
                        value={addEmail}
                        onChange={(e) => {
                            setAddEmail(e.target.value);
                            setAddError(null);
                        }}
                        placeholder="friend@hiof.no"
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent"
                    />
                    {addError && (
                        <p className="text-[11px] text-red-500">{addError}</p>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={adding || !addEmail.trim()}
                            className="cursor-pointer inline-flex items-center justify-center rounded-lg theme-bg-color px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition shadow-sm"
                        >
                            {adding ? "Adding…" : "Add"}
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <div className="mx-3 mb-2 rounded-lg bg-red-50 p-2 text-[11px] text-red-700 border border-red-100">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                {loading && (
                    <div className="text-xs text-gray-400">
                        Loading friends...
                    </div>
                )}

                {!loading && friends.length === 0 && !error && (
                    <div className="text-xs text-gray-400 italic">
                        No friends yet.
                    </div>
                )}

                {friends.map((friend) => {
                    const initials =
                        (friend.displayName ??
                            friend.email)[0]?.toUpperCase() ?? "U";

                    const isSelected = selectedFriendId === friend.userId;

                    return (
                        <div
                            key={friend.userId}
                            className={`group flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-xs cursor-pointer border transition shadow-sm ${
                                isSelected
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-100 hover:bg-gray-50"
                            }`}
                            onClick={() => onSelectFriend(friend.userId)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold theme-text-color overflow-hidden">
                                    {friend.avatarUrl ? (
                                        <img
                                            src={friend.avatarUrl}
                                            alt={
                                                friend.displayName ??
                                                friend.email
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {friend.displayName ?? friend.email}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate">
                                        {friend.displayName
                                            ? friend.email
                                            : "Friend"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(friend.userId);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 hover:text-red-600 rounded-lg px-2 py-1 transition cursor-pointer"
                            >
                                Remove
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
