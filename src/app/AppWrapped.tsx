"use client";
import { AuthProvider } from "@/app/providers/AuthProvider";

export function AppWrapped({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
