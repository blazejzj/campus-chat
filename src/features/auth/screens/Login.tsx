"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useFetch } from "@/app/hooks/useFetch";
import AuthCard from "../components/AuthCard";
import FormField from "../../../app/components/FormField";
import PrimaryButton from "../../../app/components/PrimaryButton";
import { links } from "@/app/links";
import { navigate } from "rwsdk/client";

type LoginResponse = {
    // token: string;
    user: { id: number; email: string; displayName?: string };
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
        try {
            const data = await request<LoginResponse>(links.api.auth.login, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            login(data.user);
            navigate(links.pages.dashboard);
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
                        href={links.pages.register}
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
