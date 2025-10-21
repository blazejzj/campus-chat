"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";

export default function Landing() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            window.location.href = "/dashboard";
        }
    }, [user]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-2xl px-6 py-16 text-center">
                <div className="flex gap-3 justify-center flex-col">
                    <h1 className="text-4xl font-extrabold theme-text-color">
                        CampusChat
                    </h1>
                    <p className="mt-2 text-gray-600 text-xl">
                        Nice and easy chat made by students, for students.
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3">
                    <a
                        href="/login"
                        className="px-5 py-2.5 rounded-xl font-semibold text-white theme-bg-color hover:opacity-90 transition cursor-pointer"
                    >
                        Log in
                    </a>
                    <a
                        href="/register"
                        className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                    >
                        Register
                    </a>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
                        Real-time chat
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
                        Groups & DMs
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
                        Not like Teams
                    </div>
                </div>
            </div>
        </main>
    );
}
