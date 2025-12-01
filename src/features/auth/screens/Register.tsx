"use client";

import { useMemo, useState } from "react";
import { useFetch } from "@/app/hooks/useFetch";
import AuthCard from "../components/AuthCard";
import FormField from "../../../app/components/FormField";
import PrimaryButton from "../../../app/components/PrimaryButton";
import { links } from "@/app/links";
import { navigate } from "rwsdk/client";

type RegisterFormState = {
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
};

type Requirement = {
    id: string;
    label: string;
    ok: boolean;
};

export default function Register() {
    const { request, loading, error, setError } = useFetch();

    const [form, setForm] = useState<RegisterFormState>({
        email: "",
        displayName: "",
        password: "",
        confirmPassword: "",
    });

    const requirements: Requirement[] = useMemo(() => {
        const list: Requirement[] = [];

        // https://medium.com/@python-javascript-php-html-css/the-best-regular-expression-for-email-address-verification-42bf83ba2885
        // NOT MINE REGEX pattern!
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        list.push({
            id: "email-format",
            label: "Email must be a valid email address",
            ok: emailPattern.test(form.email),
        });

        list.push({
            id: "display-name-length",
            label: "Display name must be 2–32 characters",
            ok:
                form.displayName.trim().length >= 2 &&
                form.displayName.trim().length <= 32,
        });

        list.push({
            id: "password-length",
            label: "Password must be at least 8 characters",
            ok: form.password.length >= 8,
        });

        list.push({
            id: "password-letter",
            label: "Password must contain at least one letter",
            ok: /[A-Za-z]/.test(form.password),
        });

        list.push({
            id: "password-number",
            label: "Password must contain at least one number",
            ok: /\d/.test(form.password),
        });

        list.push({
            id: "password-match",
            label: "Passwords must match",
            ok:
                form.password.length > 0 &&
                form.password === form.confirmPassword,
        });

        return list;
    }, [form]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setError("");
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const missing = requirements.filter((r) => !r.ok);
        if (missing.length > 0) {
            setError(
                "Please fix the highlighted requirements before creating your account."
            );
            return;
        }

        const body = JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            displayName: form.displayName.trim(),
        });

        try {
            await request(links.api.auth.register, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body,
            });

            navigate(links.pages.dashboard);
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
                    <a
                        href={links.pages.login}
                        className="font-semibold hover:underline"
                    >
                        Log in
                    </a>
                </span>
            }
        >
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-[11px] space-y-1">
                <p className="font-semibold text-gray-700 mb-1">
                    Account requirements
                </p>
                {requirements.map((req) => (
                    <p
                        key={req.id}
                        className={`flex items-center gap-2 ${
                            req.ok ? "text-green-600" : "text-gray-500"
                        }`}
                    >
                        <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                                req.ok
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-400 bg-white"
                            }`}
                        >
                            {req.ok ? "✓" : "•"}
                        </span>
                        {req.label}
                    </p>
                ))}
            </div>

            {error ? (
                <p
                    className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                    aria-live="polite"
                >
                    {error}
                </p>
            ) : null}

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

                <PrimaryButton disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </PrimaryButton>
            </form>
        </AuthCard>
    );
}
