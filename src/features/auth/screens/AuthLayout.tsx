"use client";
import { AuthProvider } from "@/app/providers/AuthProvider";
import type { LayoutProps } from "rwsdk/router";

export function AuthLayout({ children, requestInfo }: LayoutProps) {
    // should change any to proper type by defining user in context
    const initialUser = (requestInfo as any)?.ctx?.user ?? null;

    return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
