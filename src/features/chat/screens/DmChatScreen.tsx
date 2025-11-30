"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import useDmChat, { DmChatMessage } from "../hooks/useDmChat";
import { useAuth } from "@/app/hooks/useAuth";
import { useFetch } from "@/app/hooks/useFetch";
import { links } from "@/app/links";

/*
  simple dm ui, same card style as room/global aw yes
*/

type Props = {
    friendId: number;
    realtimeVersion?: number;
    friendLabel?: string;
    initialMessages?: DmChatMessage[];
};

export default function DmChatScreen({
    friendId,
    realtimeVersion,
    friendLabel = "Friend",
    initialMessages = [],
}: Props) {
    const { user } = useAuth();
    const currentUserId = user?.id ?? null;

    const { messages, loading, sending, error, sendMessage, reload } =
        useDmChat(friendId, initialMessages);

    const { request } = useFetch();
    const [body, setBody] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [removing, setRemoving] = useState(false);

    // reload when friend changes or realtime bumps up stuff
    useEffect(() => {
        reload();
    }, [friendId, realtimeVersion]);

    // scroll ton ewest msg first always!
    useEffect(() => {
        if (!bottomRef.current) return;

        bottomRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages.length]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;

        await sendMessage(body);
        setBody("");
    };

    const handleRemoveFriend = async () => {
        if (removing) return;

        setRemoveError(null);
        try {
            setRemoving(true);
            await request(links.api.friends.friends + "?friendId=" + friendId, {
                method: "DELETE",
                credentials: "include",
            });

            // for now we just refresh, potentially could update somehow else
            window.location.reload();
        } catch (err: any) {
            setRemoveError(
                err?.message || "Failed to remove friend. Try again please"
            );
        } finally {
            setRemoving(false);
        }
    };

    return (
        <section className="flex h-full flex-col">
            <header className="border-b border-gray-100 px-4 py-3 bg-white/90">
                <div>
                    <h2 className="text-sm font-semibold theme-text-color">
                        Direct messages
                    </h2>
                    <p className="text-[11px] text-gray-500">
                        Private chat between you and your friend.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleRemoveFriend}
                    disabled={removing}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm transition ${
                        removing
                            ? "border-red-300 bg-red-100 text-red-400 cursor-not-allowed"
                            : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                    }`}
                >
                    {removing ? "Removing…" : "Remove friend"}
                </button>
            </header>

            {removeError && (
                <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-[11px] text-red-700">
                    {removeError}
                </div>
            )}
            <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50/60">
                {loading && (
                    <p className="text-sm text-gray-500">Loading messages...</p>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                {!loading && messages.length === 0 && !error && (
                    <p className="text-sm text-gray-500">
                        No messages yet - say something exrtaordinary!
                    </p>
                )}

                {messages.map((m) => {
                    const isMine =
                        currentUserId != null && m.authorId === currentUserId;
                    const timestamp = m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : "Unknown";

                    const displayName = isMine
                        ? "You"
                        : m.authorDisplayName ?? friendLabel;

                    return (
                        <div
                            key={m.id}
                            className={`flex w-full ${
                                isMine ? "justify-end" : "justify-start"
                            }`}
                        >
                            <article
                                className={`max-w-xs sm:max-w-sm rounded-2xl px-3 py-2 text-sm shadow-sm border ${
                                    isMine
                                        ? "bg-green-500 text-white border-green-400"
                                        : "bg-white text-gray-900 border-gray-200"
                                }`}
                            >
                                <header className="mb-1 flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold truncate">
                                        {displayName}
                                    </span>
                                    <span
                                        className={`text-[10px] ${
                                            isMine
                                                ? "text-green-50/90"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {timestamp}
                                    </span>
                                </header>
                                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                    {m.body}
                                </p>
                            </article>
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </main>

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 bg-white/90"
            >
                <input
                    className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent"
                    placeholder="Write a private message…"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
                <button
                    type="submit"
                    className="rounded-full theme-bg-color px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition shadow-sm cursor-pointer"
                    disabled={!body.trim() || sending}
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </form>
        </section>
    );
}
