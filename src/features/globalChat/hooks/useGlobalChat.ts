"use client";

import { useFetch } from "@/app/hooks/useFetch";
import { links } from "@/app/links";
import { useEffect, useState } from "react";

export type GlobalChatMessage = {
    id: number;
    roomId: number | null;
    threadId: number | null;
    authorId: number | null;
    body: string | null;
    createdAt: string | null;
};

type GetMessagesResponse = {
    ok: boolean;
    data: GlobalChatMessage[];
};

type SendMessageResponse = {
    ok: boolean;
    data: GlobalChatMessage;
};

export function useGlobalChat() {
    const { request } = useFetch();

    const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadMessages() {
        try {
            setLoading(true);
            setError(null);

            const res = await request<GetMessagesResponse>(
                links.api.chat.global,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            if (!res.ok) {
                // Should be an error or maybe something else?
                throw new Error("Couldnt fetch messages!");
            }
            setMessages(res.data);
        } catch (err: any) {
            setError(err?.message ?? "Unknown error has occurred");
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage(body: string) {
        const trimmed = body.trim();

        try {
            setSending(true);
            setError(null);

            const res = await request<SendMessageResponse>(
                links.api.chat.global,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({ body: trimmed }),
                }
            );

            if (!res.ok) {
                // TODO: possibly change this error to something else
                throw new Error("Couldnt send message");
            }
            const newMessage = res.data;

            setMessages((prev) => [...prev, newMessage]);
        } catch (err: any) {
            setError(err?.message ?? "Unknown error has occurred");
        } finally {
            setSending(false);
        }
    }

    useEffect(() => {
        loadMessages();
    }, []);

    return {
        messages,
        loading,
        sending,
        error,
        reload: loadMessages,
        sendMessage,
    };
}

export default useGlobalChat;
