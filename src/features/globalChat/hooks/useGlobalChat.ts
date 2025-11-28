"use client";

import { useEffect, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";
import { links } from "@/app/links";

export type GlobalChatMessage = {
    id: number;
    roomId: number | null;
    threadId: number | null;
    authorId: number | null;
    body: string | null;
    createdAt: string | null;
};

type GetMessagesResponse = GlobalChatMessage[];
type SendMessageResponse = GlobalChatMessage;

export function useGlobalChat(initialMessages: GlobalChatMessage[] = []) {
    const { request } = useFetch();

    const [messages, setMessages] =
        useState<GlobalChatMessage[]>(initialMessages);
    const [loading, setLoading] = useState(initialMessages.length === 0);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialMessages.length > 0) {
            setMessages(initialMessages);
            setLoading(false);
        }
    }, [initialMessages]);

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

            setMessages(res);
        } catch (err: any) {
            setError(err?.message ?? "Unknown error has occurred");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialMessages.length === 0) {
            loadMessages();
        }
    }, []);

    async function sendMessage(body: string) {
        const trimmed = body.trim();
        if (!trimmed) return;

        try {
            setSending(true);
            setError(null);

            const newMessage = await request<SendMessageResponse>(
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

            setMessages((prev) => [...prev, newMessage]);
        } catch (err: any) {
            setError(err?.message ?? "Unknown error has occurred");
        } finally {
            setSending(false);
        }
    }

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
