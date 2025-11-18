"use client";

import { useState } from "react";
import type { Result } from "@/app/types/result";

type AnyResult = Result<unknown>;

// TODO: move to utils?
function isResultShape(data: any): data is AnyResult {
    return data && typeof data === "object" && "ok" in data;
}

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
                let message = "Request failed"; // default message just incase

                if (isResultShape(data) && data.ok === false) {
                    message = data.message || data.reason || message;
                } else if (
                    data &&
                    typeof data === "object" &&
                    "error" in data &&
                    typeof (data as any).error === "string"
                ) {
                    message = (data as any).error;
                }

                throw new Error(message);
            }

            if (isResultShape(data)) {
                if (data.ok) {
                    return data.data as T;
                } else {
                    const message =
                        data.message || data.reason || "Request failed";
                    throw new Error(message);
                }
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
