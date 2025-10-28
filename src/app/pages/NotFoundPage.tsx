"use client";

import { useAuth } from "@/app/hooks/useAuth";

export default function NotFoundPage() {
    const { user } = useAuth();
    const href = user ? "/dashboard" : "/login";
    const cta = user ? "Go to dashboard" : "Log in";

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-xl text-center px-6 py-16">
                <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
                <p className="mt-3 text-gray-600">
                    Looks like you're a bit lost.
                </p>
                <a
                    href={href}
                    className="inline-block mt-6 px-5 py-2.5 rounded-xl font-semibold text-white theme-bg-color hover:opacity-90 transition"
                >
                    {cta}
                </a>

                <div className="mt-10 text-sm text-gray-500">
                    <p>
                        Tried a different path? Tried to be sneaky? Double-check
                        the URL.
                    </p>
                </div>
            </div>
        </main>
    );
}
