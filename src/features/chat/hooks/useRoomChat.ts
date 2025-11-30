"use client";

import { useEffect, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";

export type RoomChatMessage = {
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

type GetMessagesResponse = RoomChatMessage[];
type SendMessageResponse = RoomChatMessage;

/*
  very similar to useGlobalChat but onl now one room
*/

export function useRoomChat(
    roomId: number,
    initialMessages: RoomChatMessage[] = []
) {
    const { request } = useFetch();

    const [messages, setMessages] =
        useState<RoomChatMessage[]>(initialMessages);
    const [loading, setLoading] = useState(initialMessages.length === 0);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // keep in sync with server-provided messages
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
                `/api/v1/groups/${roomId}/messages`,
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
                `/api/v1/groups/${roomId}/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ body: trimmed }),
                }
            );

            // avoid duplicates
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

export default useRoomChat;
