import { AuthProvider } from "@/app/providers/AuthProvider";
import type { LayoutProps } from "rwsdk/router";
import { RequestInfo } from "rwsdk/worker";

export function AuthLayout({ children, requestInfo }: LayoutProps) {
    // should change any to proper type by defining user in context
    const initialUser = (requestInfo as RequestInfo).ctx.user ?? null;

    return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
