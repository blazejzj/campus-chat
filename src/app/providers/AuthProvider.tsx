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

    const logout = () => {
        // cookie is already cleared by /api/logout, so here we just clear user
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
