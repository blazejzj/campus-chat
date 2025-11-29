"use client";

import { FormEvent, useState } from "react";
import useGlobalChat, { GlobalChatMessage } from "../hooks/useGlobalChat";
import { useAuth } from "@/app/hooks/useAuth";

type GlobalChatScreenProps = {
    initialMessages?: GlobalChatMessage[];
};

export function GlobalChatScreen({
    initialMessages = [],
}: GlobalChatScreenProps) {
    const { user } = useAuth();
    const { messages, loading, sending, error, sendMessage } =
        useGlobalChat(initialMessages);
    const [body, setBody] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!body.trim()) return;
        await sendMessage(body);
        setBody("");
    }

    return (
        <div className="flex h-full flex-col">
            <header className="border-b border-gray-100 px-4 py-3 bg-white/90">
                <h2 className="text-sm font-semibold theme-text-color">
                    Global chat
                </h2>
                <p className="text-[11px] text-gray-500">
                    Everyone connected can write here.
                </p>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50/60">
                {loading && (
                    <p className="text-sm text-gray-500">Loading messages...</p>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                {!loading && messages.length === 0 && !error && (
                    <p className="text-sm text-gray-500">
                        No messages yet - be the first to say hi
                    </p>
                )}

                {messages.map((m) => {
                    const isMine = user && m.authorId === user.id;
                    const timestamp = m.createdAt
                        ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : "Unknown";

                    const displayName = isMine
                        ? "You"
                        : `User #${m.authorId ?? "unknown"}`;

                    return (
                        <div
                            key={m.id}
                            className={`flex w-full ${
                                isMine ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-xs sm:max-w-sm rounded-2xl px-3 py-2 text-sm shadow-sm border ${
                                    isMine
                                        ? "bg-green-500 text-white border-green-400"
                                        : "bg-white text-gray-900 border-gray-200"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
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
                                </div>
                                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                    {m.body}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </main>

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 bg-white/90"
            >
                <input
                    className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent"
                    placeholder="Write a message…"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
                <button
                    type="submit"
                    className="rounded-full theme-bg-color px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition shadow-sm cursor-pointer"
                    disabled={!body.trim() || sending}
                >
                    {sending ? "Sending…" : "Send"}
                </button>
            </form>
        </div>
    );
}

export default GlobalChatScreen;
