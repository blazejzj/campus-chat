"use client";

import { FormEvent, useState } from "react";
import useGlobalChat from "../hooks/useGlobalChat";

export function GlobalChatScreen() {
    const { messages, loading, sending, error, sendMessage } = useGlobalChat();
    const [body, setBody] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!body.trim()) return;
        await sendMessage(body);
        setBody("");
    }

    return (
        <div className="flex h-full flex-col">
            <header className="border-b p-3">
                <h2 className="text-lg font-semibold">Global chat</h2>
                <p className="text-xs text-gray-500">Everone can write here!</p>
            </header>

            <main className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading && (
                    <p className="text-sm text-gray-500">Loading messages...</p>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                {!loading && messages.length === 0 && !error && (
                    <p className="text-sm text-gray-500">No messages yet!</p>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className="rounded bg-slate-100 p-2 text-sm"
                    >
                        <div className="text-[11px] text-gray-500 mb-0.5">
                            User #{m.authorId ?? "unknown"} ·{" "}
                            {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString()
                                : "Unknown timestamp"}
                        </div>
                        <div>{m.body}</div>
                    </div>
                ))}
            </main>

            <form
                onSubmit={handleSubmit}
                className="border-t p-3 flex gap-2 items-center"
            >
                <input
                    className="flex-1 rounded border px-3 py-2 text-sm"
                    placeholder="Write a message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
                <button
                    type="submit"
                    className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    disabled={!body.trim() || sending}
                >
                    {sending ? "Sending" : "Send"}
                </button>
            </form>
        </div>
    );
}

export default GlobalChatScreen;
