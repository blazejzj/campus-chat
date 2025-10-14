"use client";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";

type LoginResponse = {
    token: string;
    user: { id: number; email: string };
};

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => ({}))) as {
                    error?: string;
                };
                throw new Error(data.error ?? "Login failed");
            }

            const data = (await response.json()) as LoginResponse;
            login(data.token, data.user);

            window.location.href = "/dashboard";
        } catch (e: any) {
            setError(e.message ?? "Something went wrong!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-sm p-6">
            <a href="/" className="text-sm">
                Go Back
            </a>

            <h2 className="text-2xl font-semibold mt-2 mb-4 theme-text-color">
                Log in
            </h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <label className="text-left space-y-1 w-full">
                    <span className="text-sm font-medium text-gray-800">
                        Email
                    </span>
                    <input
                        name="email"
                        className="w-full border rounded-xl px-3 py-2"
                        type="email"
                        placeholder="hughjass@hiof.no"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label className="text-left space-y-1 w-full">
                    <span className="text-sm font-medium text-gray-800">
                        Password
                    </span>
                    <input
                        name="password"
                        className="w-full border rounded-xl px-3 py-2"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                    />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    className="rounded-xl theme-bg-color text-white py-2 disabled:opacity-60"
                    disabled={loading}
                >
                    {loading ? "Logging in ..." : "Log in"}
                </button>
            </form>

            <p className="text-sm mt-3">
                No account?{" "}
                <a href="/register" className="font-bold">
                    Register here
                </a>
            </p>
        </main>
    );
}
