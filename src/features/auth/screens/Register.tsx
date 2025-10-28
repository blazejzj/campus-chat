"use client";

import { useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";
import AuthCard from "../components/AuthCard";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";

export default function Register() {
    const { request, loading, error, setError } = useFetch();

    const [form, setForm] = useState({
        email: "",
        displayName: "",
        password: "",
        confirmPassword: "",
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(function update(prev) {
            return { ...prev, [name]: value };
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const body = JSON.stringify({
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            displayName: form.displayName,
        });

        try {
            await request("/api/v1/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body,
            });

            // using window.location here
            // also, should we just log users in here immediately or just redirect them?
            window.location.href = "/login";
        } catch {
            // keep it simple: error is already set by the hook
        }
    }

    return (
        <AuthCard
            title="Create an account"
            footer={
                <span>
                    Already have an account?{" "}
                    <a href="/login" className="font-semibold hover:underline">
                        Log in
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
                    label="Display name"
                    name="displayName"
                    type="text"
                    placeholder="hughjass"
                    value={form.displayName}
                    onChange={handleChange}
                />
                <FormField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="new-password"
                />
                <FormField
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    minLength={8}
                    autoComplete="new-password"
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
                    {loading ? "Creating account..." : "Register"}
                </PrimaryButton>
            </form>
        </AuthCard>
    );
}
