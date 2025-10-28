"use client";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { LayoutProps } from "rwsdk/router";

export function AuthLayout({ children }: LayoutProps) {
    return <AuthProvider>{children}</AuthProvider>;
}
