"use client";

import { createContext, useState } from "react";
import { User as CoreUser } from "../../../types/User";

type AuthUser = CoreUser | null;

type AuthContextType = {
    user: AuthUser;
    login: (user: CoreUser) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
    initialUser = null,
}: {
    children: React.ReactNode;
    initialUser?: CoreUser | null;
}) {
    const [user, setUser] = useState<AuthUser>(initialUser);

    const login = (nextUser: CoreUser) => {
        // cookie is already set by /api/login, so here we just hydrate
        setUser(nextUser);
    };

    // logs out user both client and server side, unsure if this is teh goto method
    // or if should be done 2 different places but here we are
    const logout = async () => {
        try {
            await fetch("/api/v1/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            // ignore errors here for now
        }
        setUser(null);
        location.replace("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
