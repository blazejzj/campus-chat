"use client";

import { useState } from "react";

export function useFetch() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function request<T = unknown>(
        url: string,
        options?: RequestInit
    ): Promise<T> {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(url, options);
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const message =
                    (data as { error?: string }).error || "Request failed";
                throw new Error(message);
            }

            return data as T;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { request, loading, error, setError };
}
