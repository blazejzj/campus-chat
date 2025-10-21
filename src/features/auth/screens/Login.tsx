"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useFetch } from "@/app/hooks/useFetch";
import AuthCard from "../components/AuthCard";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";

type LoginResponse = {
    token: string;
    user: { id: number; email: string };
};

export default function Login() {
    const { login } = useAuth();
    const { request, loading, error, setError } = useFetch();

    const [form, setForm] = useState({ email: "", password: "" });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const body = JSON.stringify(form);

        try {
            const data = await request<LoginResponse>("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body,
            });

            login(data.token, data.user);
            window.location.href = "/dashboard";
        } catch {
            // keep it simple here i think, the error is already set by the hook
        }
    }

    return (
        <AuthCard
            title="Log in"
            footer={
                <span>
                    No account?{" "}
                    <a
                        href="/register"
                        className="font-semibold hover:underline"
                    >
                        Register here
                    </a>
                </span>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="hughjass@hiof.no"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                />
                <FormField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="********"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="current-password"
                />

                {error ? (
                    <p
                        className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"
                        aria-live="polite"
                    >
                        {error}
                    </p>
                ) : null}

                <PrimaryButton disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                </PrimaryButton>
            </form>
        </AuthCard>
    );
}
