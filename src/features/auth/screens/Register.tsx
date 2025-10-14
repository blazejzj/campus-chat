"use client";
import { useState } from "react";

export default function Register() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        // check first if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // try to register
        try {
            const response = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => ({}))) as {
                    error?: string;
                };
                throw new Error(data.error ?? "Registration failed");
            }

            // we use again window.location, evn though I was sure i saw navigate, but it doesnt work
            // or i am not competent enough lol
            window.location.href = "/login";
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
                Create an account
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

                <label className="text-left space-y-1 w-full">
                    <span className="text-sm font-medium text-gray-800">
                        Confirm password
                    </span>
                    <input
                        name="confirmPassword"
                        className="w-full border rounded-xl px-3 py-2"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
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
                    {loading ? "Creating account ..." : "Register"}
                </button>
            </form>

            <p className="text-sm mt-3">
                Already have an account?{" "}
                <a href="/login" className="font-bold">
                    Log in
                </a>
            </p>
        </main>
    );
}
