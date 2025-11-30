"use client";

import { useEffect, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";

export type DmChatMessage = {
    id: number;
    roomId: number | null;
    threadId: number | null;
    authorId: number | null;
    body: string | null;
    createdAt: string | null;
    authorDisplayName?: string | null;
    authorAvatarUrl?: string | null;
    authorEmail?: string | null;
};

type GetMessagesResponse = DmChatMessage[];
type SendMessageResponse = DmChatMessage;

/*
  small hook for direct messages with one friend
*/

export function useDmChat(
    friendId: number,
    initialMessages: DmChatMessage[] = []
) {
    const { request } = useFetch();

    const [messages, setMessages] = useState<DmChatMessage[]>(initialMessages);
    const [loading, setLoading] = useState(initialMessages.length === 0);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialMessages.length > 0) {
            setMessages(initialMessages);
            setLoading(false);
        }
    }, [initialMessages]);

    async function reload() {
        try {
            setLoading(true);
            setError(null);

            const res = await request<GetMessagesResponse>(
                `/api/v1/dm/${friendId}/messages`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            setMessages(res);
        } catch (err: any) {
            setError(err?.message ?? "Unknown error while loading messages");
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage(body: string) {
        const trimmed = body.trim();
        if (!trimmed) return;

        try {
            setSending(true);
            setError(null);

            const newMessage = await request<SendMessageResponse>(
                `/api/v1/dm/${friendId}/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ body: trimmed }),
                }
            );

            setMessages((prev) => {
                const exists = prev.some((m) => m.id === newMessage.id);
                if (exists) return prev;
                return [...prev, newMessage];
            });
        } catch (err: any) {
            setError(err?.message ?? "Unknown error while sending message");
        } finally {
            setSending(false);
        }
    }

    return {
        messages,
        loading,
        sending,
        error,
        reload,
        sendMessage,
    };
}

export default useDmChat;
